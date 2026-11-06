import { byEmail, type LegalFacts, type LegalTexts } from ".";

// French typography: non-breaking space before : ; ! ? and inside « ».

export const legal = (f: LegalFacts): LegalTexts => ({
  privacy: {
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour : 6 novembre 2026",
    sections: [
      {
        heading: "Responsable du traitement",
        blocks: [
          `${f.identity}, est responsable du traitement des données personnelles collectées sur le site ${f.domain}.`,
        ],
      },
      {
        heading: "Les données que nous collectons",
        blocks: [
          [
            "Celles que vous nous envoyez via le formulaire de demande de devis : nom, mobile, e-mail, zone, type de nettoyage et les détails que vous choisissez de partager.",
            "Les données techniques nécessaires au fonctionnement du site (par exemple l’adresse IP et le type de navigateur), traitées par notre hébergeur.",
          ],
          "Nous ne demandons aucune donnée sensible (santé, convictions, etc.). Merci de ne pas en indiquer dans le champ des détails.",
        ],
      },
      {
        heading: "Pourquoi nous les utilisons, et sur quelle base",
        blocks: [
          [
            "Répondre à votre demande et préparer une proposition : mesures précontractuelles prises à votre demande (article 6, paragraphe 1, point b du RGPD).",
            "Réaliser et facturer la prestation commandée, et respecter nos obligations légales, notamment fiscales (article 6, paragraphe 1, points b et c du RGPD).",
            "Assurer la sécurité et le bon fonctionnement du site : intérêt légitime (article 6, paragraphe 1, point f du RGPD).",
          ],
          "Nous ne vendons jamais vos données et ne les utilisons pas à des fins publicitaires.",
        ],
      },
      {
        heading: "Combien de temps nous les conservons",
        blocks: [
          "Les demandes de devis qui n’aboutissent pas à une prestation sont supprimées dans un délai de 12 mois au plus. Les données des clients sont conservées pendant toute la relation commerciale, puis pendant la durée imposée par la loi pour les documents de facturation et de comptabilité.",
        ],
      },
      {
        heading: "Avec qui nous les partageons",
        blocks: [
          "Uniquement avec les prestataires qui nous aident à faire fonctionner le site et le service (hébergement, e-mail, gestion des clients), qui agissent pour notre compte dans le cadre d’un contrat, et avec les autorités lorsque la loi l’exige.",
          "Si l’un de ces prestataires traite des données hors de l’Espace économique européen, le transfert repose sur les garanties prévues par le RGPD, comme les clauses contractuelles types de la Commission européenne.",
        ],
      },
      {
        heading: "Cookies",
        blocks: [
          "Le site utilise un seul cookie technique, NEXT_LOCALE, qui mémorise pendant 12 mois la langue que vous avez choisie. Nous n’utilisons aucun cookie de mesure d’audience ni de publicité.",
          "Le lien « Ouvrir dans Google Maps » mène au site de Google, qui applique sa propre politique de confidentialité.",
        ],
      },
      {
        heading: "Vos droits",
        blocks: [
          "Vous pouvez à tout moment demander l’accès, la rectification, l’effacement, la limitation ou la portabilité de vos données, et vous opposer à leur traitement.",
          byEmail(
            f,
            (email) => `Il suffit de nous écrire à ${email}.`,
            "Il suffit de nous écrire à l’adresse indiquée ci-dessus.",
          ),
          "Si vous estimez que vos données ne sont pas traitées correctement, vous pouvez saisir l’autorité portugaise de protection des données (CNPD) sur www.cnpd.pt.",
        ],
      },
      {
        heading: "Modifications",
        blocks: [
          "Nous pouvons mettre à jour cette politique. La version en vigueur est toujours celle publiée sur ce site, avec sa date de dernière mise à jour.",
        ],
      },
    ],
  },

  terms: {
    title: "Conditions générales",
    updated: "Dernière mise à jour : 6 novembre 2026",
    sections: [
      {
        heading: "Qui sommes-nous ?",
        blocks: [
          `Le site ${f.domain} et les services Clara sont exploités par ${f.identity}. En utilisant le site ou en demandant un devis, vous acceptez ces conditions.`,
        ],
      },
      {
        heading: "Services",
        blocks: [
          "Clara propose des services de ménage aux particuliers et aux entreprises à Lisbonne et alentours : ménage à domicile, nettoyage de bureaux, de fin de chantier, des vitres, des canapés et des locations saisonnières, ponctuellement ou régulièrement. Les descriptions du site sont indicatives.",
        ],
      },
      {
        heading: "Devis",
        blocks: [
          "Les demandes de devis sont gratuites et sans engagement. Chaque proposition précise la prestation, le prix, la date et les conditions applicables, et n’engage les parties qu’une fois acceptée par vous et confirmée par Clara.",
          "Si les conditions de la proposition acceptée diffèrent de ces conditions générales, celles de la proposition prévalent.",
        ],
      },
      {
        heading: "Réservation et accès aux lieux",
        blocks: [
          "Nous convenons avec vous de la date, de l’horaire et de la manière d’accéder aux lieux. Signalez-nous avant l’intervention toute particularité : matériaux délicats, animaux, zones à éviter.",
        ],
      },
      {
        heading: "Modification et annulation",
        blocks: [
          "Vous pouvez modifier ou annuler une réservation en nous contactant le plus tôt possible. Les délais et éventuels frais d’annulation sont ceux indiqués dans la proposition.",
        ],
      },
      {
        heading: "Prix et paiement",
        blocks: [
          "Les prix sont ceux de la proposition acceptée et s’entendent TVA comprise au taux en vigueur, sauf mention contraire. Le moyen et le délai de paiement figurent sur la proposition et sur la facture.",
        ],
      },
      {
        heading: "Qualité et responsabilité",
        blocks: [
          "Nous réalisons chaque prestation avec soin. Si vous constatez un problème, prévenez-nous au plus vite après l’intervention pour que nous puissions y remédier.",
          "Clara n’est pas responsable des dommages résultant d’informations inexactes ou omises par le client, ni de l’usure préexistante des matériaux, sans préjudice des droits que la loi garantit aux consommateurs.",
        ],
      },
      {
        heading: "Utilisation du site",
        blocks: [
          "Les textes, les images et la marque Clara sont protégés et ne peuvent pas être réutilisés sans autorisation. Nous veillons à tenir le site à jour, mais il peut contenir des imprécisions.",
        ],
      },
      {
        heading: "Réclamations et litiges",
        blocks: [
          "Vous pouvez déposer une réclamation dans le Livre de réclamations électronique, sur www.livroreclamacoes.pt.",
          "En cas de litige de consommation, vous pouvez recourir à un organisme de règlement extrajudiciaire des litiges, comme le Centre d’arbitrage des litiges de consommation de Lisbonne (www.centroarbitragemlisboa.pt). Plus d’informations sur le Portail du consommateur, sur www.consumidor.gov.pt.",
        ],
      },
      {
        heading: "Droit applicable",
        blocks: ["Ces conditions sont régies par le droit portugais."],
      },
    ],
  },
});
