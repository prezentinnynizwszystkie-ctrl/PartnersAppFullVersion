
// utils/emailTemplates.ts

export const getPostMeetingTemplate = (
  clientName: string,
  senderName: string,
  senderPhone: string,
  linkToProposal: string = "https://multibajka.pl" // Domyślny link, w przyszłości dynamiczny
) => {
  return `
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Podsumowanie rozmowy</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f9f9f9;">

    <!-- Wrapper -->
    <div style="width: 100%; background-color: #f9f9f9; padding: 40px 0;">
        
        <!-- Main Card -->
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            
            <!-- Header Stripe (Subtle branding) -->
            <div style="height: 6px; background-color: #2563eb; width: 100%;"></div>

            <div style="padding: 40px;">
                
                <!-- Salutation -->
                <p style="margin-top: 0; margin-bottom: 24px; font-size: 16px; color: #111111;">
                    Cześć <strong>${clientName}</strong>,
                </p>

                <!-- Body -->
                <p style="margin-bottom: 24px; font-size: 16px; color: #4b5563;">
                    Dzięki za naszą dzisiejszą rozmowę. Zgodnie z ustaleniami, przygotowałem dla Ciebie wstępną koncepcję wdrożenia.
                </p>

                <p style="margin-bottom: 24px; font-size: 16px; color: #4b5563;">
                    Pod poniższym linkiem znajdziesz <strong>spersonalizowane podsumowanie</strong> oraz wideo, w którym pokazuję, jak rozwiązanie może zadziałać w Waszym obiekcie:
                </p>

                <!-- CTA Button -->
                <div style="margin: 32px 0; text-align: center;">
                    <a href="${linkToProposal}" 
                       style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
                       Zobacz przygotowany projekt
                    </a>
                </div>

                <p style="margin-bottom: 24px; font-size: 16px; color: #4b5563;">
                    Przejrzyj to proszę w wolnej chwili. Będę wdzięczny za informację zwrotną – chętnie umówię się na krótkie spotkanie, aby omówić konkrety.
                </p>

                <div style="height: 1px; background-color: #f3f4f6; margin: 32px 0;"></div>

                <!-- Personal Footer -->
                <div style="font-size: 15px; color: #1f2937;">
                    <p style="margin: 0; font-weight: bold;">${senderName}</p>
                    <p style="margin: 4px 0 0 0; color: #6b7280;">Business Development Manager</p>
                    <p style="margin: 4px 0 0 0;">
                        <a href="tel:${senderPhone}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${senderPhone}</a>
                    </p>
                    <p style="margin: 4px 0 0 0; font-size: 14px; color: #9ca3af;">MultiBajka Experience</p>
                </div>

            </div>
        </div>

        <!-- Unsubscribe / Anti-Spam Footer -->
        <div style="max-width: 600px; margin: 20px auto; text-align: center; font-size: 11px; color: #9ca3af;">
            <p style="margin: 0;">
                Otrzymałeś tę wiadomość w nawiązaniu do naszej rozmowy biznesowej.
            </p>
            <p style="margin: 5px 0 0 0;">
                Nie chcesz otrzymywać od nas wiadomości? 
                <a href="{{{ pm:unsubscribe }}}" style="color: #6b7280; text-decoration: underline;">Anuluj subskrypcję</a>.
            </p>
            <p style="margin: 5px 0 0 0;">
                MultiBajka ul. Przykładowa 123, 00-001 Warszawa
            </p>
        </div>

    </div>

</body>
</html>
  `;
};
