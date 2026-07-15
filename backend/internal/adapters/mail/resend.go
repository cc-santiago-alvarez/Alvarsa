// Package mail contiene adaptadores de salida para notificaciones por correo.
package mail

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"html"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// resendEndpoint es la API de envío de Resend (https://resend.com/docs/api-reference).
const resendEndpoint = "https://api.resend.com/emails"

// Resend implementa ports.Mailer usando la API HTTP de Resend. No requiere SDK:
// una llamada POST con Bearer token basta. El envío es best-effort — registra
// los fallos en el log pero deja que el core decida no propagarlos.
type Resend struct {
	apiKey string
	from   string // remitente verificado, p. ej. "Alvarsa <no-reply@alvarsa.com>"
	to     string // destinatario de las notificaciones (el taller)
	client *http.Client
}

// NewResend crea el adaptador. from debe ser un remitente de un dominio
// verificado en Resend; to es la casilla del taller que recibe los avisos.
func NewResend(apiKey, from, to string) *Resend {
	return &Resend{
		apiKey: apiKey,
		from:   from,
		to:     to,
		client: &http.Client{Timeout: 10 * time.Second},
	}
}

func (r *Resend) SendContactNotification(ctx context.Context, c domain.ContactRequest) error {
	subject := fmt.Sprintf("Nuevo mensaje de contacto — %s", c.Name)

	var b strings.Builder
	b.WriteString("<h2>Nuevo mensaje de contacto</h2>")
	row(&b, "Nombre", c.Name)
	row(&b, "Teléfono", c.Phone)
	row(&b, "Correo", c.Email)
	b.WriteString("<p><strong>Motivo:</strong><br>")
	b.WriteString(html.EscapeString(c.Reason))
	b.WriteString("</p>")
	if n := len(c.Attachments); n > 0 {
		fmt.Fprintf(&b, "<p><em>%d adjunto(s).</em></p>", n)
	}
	fmt.Fprintf(&b, "<hr><p style=\"color:#888;font-size:12px\">ID %s</p>", html.EscapeString(c.ID))

	return r.send(ctx, subject, b.String())
}

func (r *Resend) SendQuoteNotification(ctx context.Context, q domain.Quote) error {
	subject := fmt.Sprintf("Nueva cotización — %s", q.Contact.Name)

	var b strings.Builder
	b.WriteString("<h2>Nueva solicitud de cotización</h2>")
	row(&b, "Nombre", q.Contact.Name)
	row(&b, "Teléfono", q.Contact.Phone)
	row(&b, "Correo", q.Contact.Email)

	b.WriteString("<h3>Ítems</h3><ul>")
	for _, it := range q.Items {
		qty := it.Qty
		if qty < 1 {
			qty = 1
		}
		fmt.Fprintf(&b, "<li>%d × %s — %s",
			qty, html.EscapeString(it.Name), formatCOP(it.Price))
		if len(it.Options) > 0 {
			b.WriteString(" <span style=\"color:#888\">(")
			b.WriteString(html.EscapeString(formatOptions(it.Options)))
			b.WriteString(")</span>")
		}
		b.WriteString("</li>")
	}
	b.WriteString("</ul>")
	fmt.Fprintf(&b, "<p><strong>Subtotal:</strong> %s</p>", formatCOP(q.Subtotal))
	fmt.Fprintf(&b, "<hr><p style=\"color:#888;font-size:12px\">ID %s</p>", html.EscapeString(q.ID))

	return r.send(ctx, subject, b.String())
}

// send hace la llamada HTTP a Resend y registra los fallos.
func (r *Resend) send(ctx context.Context, subject, htmlBody string) error {
	payload := map[string]any{
		"from":    r.from,
		"to":      []string{r.to},
		"subject": subject,
		"html":    htmlBody,
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, resendEndpoint, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+r.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := r.client.Do(req)
	if err != nil {
		log.Printf("mail: envío a Resend fallido: %v", err)
		return err
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode >= 300 {
		msg, _ := io.ReadAll(io.LimitReader(resp.Body, 2048))
		log.Printf("mail: Resend respondió %d: %s", resp.StatusCode, strings.TrimSpace(string(msg)))
		return fmt.Errorf("resend: status %d", resp.StatusCode)
	}
	return nil
}

// row escribe una fila "Etiqueta: valor" solo si el valor no está vacío.
func row(b *strings.Builder, label, value string) {
	if strings.TrimSpace(value) == "" {
		return
	}
	fmt.Fprintf(b, "<p><strong>%s:</strong> %s</p>", label, html.EscapeString(value))
}

// formatOptions serializa las opciones de personalización de forma estable.
func formatOptions(opts map[string]string) string {
	keys := make([]string, 0, len(opts))
	for k := range opts {
		keys = append(keys, k)
	}
	sortStrings(keys)
	parts := make([]string, 0, len(keys))
	for _, k := range keys {
		parts = append(parts, k+": "+opts[k])
	}
	return strings.Join(parts, ", ")
}

// formatCOP formatea un entero de pesos colombianos con separador de miles.
func formatCOP(v int64) string {
	neg := v < 0
	if neg {
		v = -v
	}
	digits := fmt.Sprintf("%d", v)
	var out []byte
	for i := 0; i < len(digits); i++ {
		if i > 0 && (len(digits)-i)%3 == 0 {
			out = append(out, '.')
		}
		out = append(out, digits[i])
	}
	sign := ""
	if neg {
		sign = "-"
	}
	return "$" + sign + string(out)
}

// sortStrings ordena in-place (insertion sort; listas de opciones muy pequeñas).
func sortStrings(s []string) {
	for i := 1; i < len(s); i++ {
		for j := i; j > 0 && s[j-1] > s[j]; j-- {
			s[j-1], s[j] = s[j], s[j-1]
		}
	}
}
