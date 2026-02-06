
// utils/emailTemplates.ts

export const getPostMeetingTemplate = (
  clientName: string,
  senderName: string,
  senderPhone: string,
  linkToProposal: string = "https://multibajka.pl"
) => {
  // Logika bezpiecznego powitania:
  // Jeśli imię to placeholder "Partnerze" lub jest puste -> "Dzień dobry,"
  // W przeciwnym razie -> "Cześć [Imię],"
  const isGeneric = !clientName || clientName.trim() === '' || clientName === 'Partnerze';
  const greeting = isGeneric ? 'Dzień dobry,' : `Cześć ${clientName},`;

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #222222; background-color: #ffffff; margin: 0; padding: 10px;">

    <p style="margin-bottom: 12px;">${greeting}</p>

    <p style="margin-bottom: 12px;">
        Dzięki za naszą dzisiejszą rozmowę. Zgodnie z ustaleniami, przygotowałem dla Ciebie wstępną koncepcję wdrożenia.
    </p>

    <p style="margin-bottom: 12px;">
        Tutaj znajdziesz podsumowanie wszystkiego, o czym rozmawialiśmy:<br>
        <a href="${linkToProposal}" style="color: #1155cc; text-decoration: underline;">${linkToProposal}</a>
    </p>

    <p style="margin-bottom: 20px;">
        Przejrzyj to proszę w wolnej chwili. Chętnie umówię się na krótkie spotkanie, żeby dopiąć szczegóły.
    </p>

    <p style="margin-bottom: 0;">Pozdrawiam,</p>
    <p style="margin-top: 0;">
        <strong>${senderName}</strong><br>
        Business Development Manager<br>
        tel. ${senderPhone}<br>
        MultiBajka Experience
    </p>

    <br>
    
    <div style="font-size: 11px; color: #999999; margin-top: 20px; border-top: 1px solid #eeeeee; padding-top: 10px;">
        <p style="margin: 0;">Otrzymałeś tę wiadomość w nawiązaniu do naszej rozmowy biznesowej.<br>
        <a href="{{{ pm:unsubscribe }}}" style="color: #999999; text-decoration: underline;">Rezygnacja z subskrypcji</a></p>
    </div>

</body>
</html>
  `;
};
