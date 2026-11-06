import type { Dictionary } from "./pt";

// French copy. " " = non-breaking space before ? ! : (French typography).

export const fr: Dictionary = {
  meta: {
    title: "Clara — Ménage professionnel à Lisbonne",
    description:
      "Clara — ménage professionnel à Lisbonne. Ménage à domicile, bureaux, fin de chantier, vitres, canapés et locations saisonnières.",
  },
  nav: {
    home: "Clara, accueil",
    city: "LISBOA",
    label: "Navigation principale",
    services: "Services",
    why: "Pourquoi Clara ?",
    how: "Comment ça marche",
    contact: "Contact",
    quote: "Demander un devis",
    menu: "Menu",
    language: "Langue / Language",
  },
  hero: {
    imageAlt:
      "Une professionnelle de Clara passe l’aspirateur dans un salon lumineux à Lisbonne, fenêtres ouvertes sur les toits et le Tage",
    chip: "Plus de temps pour l’essentiel.",
    eyebrow: "Ménage professionnel à Lisbonne",
    title: { lead: "Votre maison,", highlight: "impeccable." },
    intro:
      "Des services de ménage pensés pour simplifier votre quotidien. Pour les maisons, les bureaux et tous les espaces qui méritent d’être à leur meilleur.",
    cta: "Demander un devis",
    services: "Voir les services",
    note: "Devis sans engagement, adapté à votre espace.",
  },
  trust: {
    label: "Pourquoi choisir Clara",
    items: {
      schedule: {
        title: "Horaires flexibles",
        text: "Ménage ponctuel ou régulier",
      },
      trust: {
        title: "Un service de confiance",
        text: "Attention portée à chaque détail",
      },
      area: {
        title: "Lisbonne et alentours",
        text: "Maisons, bureaux et locations saisonnières",
      },
      language: { title: "Portugais et anglais", text: "Nous parlons votre langue" },
    },
  },
  services: {
    eyebrow: "Ce que nous faisons",
    title: "Un ménage adapté à votre espace",
    description:
      "Des solutions de nettoyage pour des espaces, des besoins et des rythmes différents.",
    all: "Demander un devis",
    link: "Demander un devis",
    items: {
      domestica: {
        name: "Ménage à domicile",
        description:
          "Ménage ponctuel ou régulier pour une maison toujours accueillante.",
      },
      escritorios: {
        name: "Nettoyage de bureaux",
        description: "Des espaces de travail organisés, propres et agréables.",
      },
      posobra: {
        name: "Nettoyage de fin de chantier",
        description:
          "Le nettoyage final après des travaux, une rénovation ou un déménagement.",
      },
      vidros: {
        name: "Nettoyage des vitres",
        description: "Fenêtres et surfaces vitrées sans traces.",
      },
      estofos: {
        name: "Canapés et tissus d’ameublement",
        description:
          "Un soin spécifique pour les textiles et les surfaces rembourrées.",
      },
      alojamento: {
        name: "Locations saisonnières",
        description:
          "Le ménage entre deux séjours, pour accueillir chaque nouveau voyageur.",
      },
    },
  },
  why: {
    card: {
      eyebrow: "L’expérience Clara",
      title: ["Un espace propre.", "Une vie plus légère."],
      description:
        "Nous pensons qu’un service de ménage doit apporter bien plus que des résultats visibles : il doit vous libérer du temps et simplifier votre journée.",
      cta: "Parlons-en ?",
    },
    eyebrow: "Pourquoi Clara ?",
    title: ["Simple, soigné", "et sur mesure."],
    description:
      "Du premier message à la dernière pièce nettoyée, tout est pensé pour que vous n’ayez à vous soucier de rien.",
    features: {
      simple: {
        title: "Simple dès le premier contact",
        text: "Dites-nous ce dont vous avez besoin et demandez une proposition adaptée à votre espace.",
      },
      detail: {
        title: "Le souci du détail",
        text: "Une approche soignée, pensée pour chaque type de nettoyage.",
      },
      calm: {
        title: "Plus de sérénité au quotidien",
        text: "Moins de tâches sur votre liste. Plus de temps pour vous.",
      },
    },
    how: "Comment ça marche",
  },
  how: {
    eyebrow: "Sans complication",
    title: "Comment ça marche",
    description:
      "Un parcours simple, de la demande de devis à un espace impeccable.",
    steps: {
      tell: {
        title: "Dites-nous ce dont vous avez besoin",
        text: "Indiquez le type d’espace, le lieu et le nettoyage souhaité.",
      },
      proposal: {
        title: "Recevez une proposition",
        text: "Nous étudions votre demande et vous proposons une solution adaptée.",
      },
      clean: {
        title: "Nous nous occupons du ménage",
        text: "Nous convenons des détails et prenons soin de votre espace.",
      },
    },
  },
  contact: {
    eyebrow: "Demander un devis",
    title: ["Et si tout devenait", "plus clair ?"],
    description:
      "Parlez-nous un peu de votre espace et du type de nettoyage que vous recherchez. C’est la première étape vers une proposition sur mesure.",
    points: {
      types: "Ménage pour particuliers et entreprises",
      frequency: "Services ponctuels ou réguliers",
      area: "Lisbonne et alentours",
    },
  },
  form: {
    title: "Demandez une proposition",
    description: "Remplissez les champs ci-dessous pour préparer votre demande.",
    labels: {
      service: "Type de nettoyage",
      name: "Nom",
      phone: "Mobile",
      email: "E-mail",
      area: "Zone",
      message: "Détails (facultatif)",
    },
    placeholders: {
      service: "Choisir un service",
      name: "Votre nom",
      phone: "+351 ...",
      email: "exemple@email.com",
      area: "Lisbonne, Oeiras...",
      message: "Type de logement, surface approximative, fréquence souhaitée...",
    },
    submit: "Demander un devis",
    sending: "Envoi en cours...",
    note: "Vos données servent uniquement à répondre à votre demande.",
    status: {
      invalid: "Veuillez remplir les champs obligatoires pour continuer.",
      demo: "Démonstration : le formulaire n’est pas encore relié à un système d’envoi.",
      success:
        "Merci ! Nous avons bien reçu votre demande et vous recontacterons très vite.",
      error: "Impossible d’envoyer votre demande. Veuillez réessayer.",
    },
  },
  band: {
    label: "Demander un devis",
    eyebrow: "Plus de temps pour l’essentiel",
    title: "Rentrez chez vous et retrouvez tout impeccable.",
    cta: "Demander un devis",
  },
  footer: {
    label: "Pied de page",
    tagline: "Votre maison, impeccable. · Lisbonne, Portugal",
    privacy: "Confidentialité",
    terms: "Conditions",
    complaints: "Livre de réclamations",
    made: "Ménage professionnel à Lisbonne et alentours",
  },
};
