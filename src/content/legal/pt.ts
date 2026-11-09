import { byEmail, type LegalFacts, type LegalTexts } from ".";

export const legal = (f: LegalFacts): LegalTexts => ({
  privacy: {
    title: "Política de Privacidade",
    updated: "Última atualização: 9 de novembro de 2026",
    sections: [
      {
        heading: "Responsável pelo tratamento",
        blocks: [
          `${f.identity}, é responsável pelo tratamento dos dados pessoais recolhidos através do site ${f.domain}.`,
        ],
      },
      {
        heading: "Dados que recolhemos",
        blocks: [
          [
            "Os dados que nos envia no pedido de orçamento: nome, telemóvel, e-mail, zona, tipo de limpeza, características do espaço, datas preferidas e os detalhes que decidir partilhar.",
            "O que acrescentar no espaço pessoal do seu pedido: mensagens, fotos do espaço e a resposta à proposta. Esse espaço abre-se com a ligação pessoal que lhe enviamos por e-mail; guarde-a para si.",
            "Os dados técnicos necessários ao funcionamento do site (por exemplo, o endereço IP e o tipo de navegador), tratados pelo nosso fornecedor de alojamento.",
          ],
          "Não pedimos dados sensíveis (saúde, convicções, etc.). Pedimos-lhe que não os inclua no campo de detalhes.",
        ],
      },
      {
        heading: "Para que usamos os dados e com que fundamento",
        blocks: [
          [
            "Responder ao seu pedido e preparar uma proposta: diligências pré-contratuais a seu pedido (artigo 6.º, n.º 1, alínea b) do RGPD).",
            "Prestar o serviço contratado, faturá-lo e cumprir as nossas obrigações legais, nomeadamente fiscais (artigo 6.º, n.º 1, alíneas b) e c) do RGPD).",
            "Garantir a segurança e o bom funcionamento do site: interesse legítimo (artigo 6.º, n.º 1, alínea f) do RGPD).",
          ],
          "Não vendemos os seus dados nem os usamos para publicidade.",
        ],
      },
      {
        heading: "Durante quanto tempo os guardamos",
        blocks: [
          "Os pedidos de orçamento que não dão origem a um serviço são apagados no prazo máximo de 12 meses. Os dados de clientes são conservados enquanto durar a relação comercial e, depois, durante o prazo que a lei impõe para os documentos de faturação e de contabilidade.",
        ],
      },
      {
        heading: "Com quem os partilhamos",
        blocks: [
          "Apenas com os prestadores que nos ajudam a gerir o site e o serviço (alojamento, e-mail, gestão de clientes), que atuam por nossa conta e ao abrigo de um contrato, e com as autoridades quando a lei o exija.",
          "Se algum destes prestadores tratar dados fora do Espaço Económico Europeu, a transferência é feita com as garantias previstas no RGPD, como as cláusulas contratuais-tipo da Comissão Europeia.",
        ],
      },
      {
        heading: "Cookies",
        blocks: [
          "O site usa apenas um cookie técnico, NEXT_LOCALE, que guarda durante 12 meses o idioma que escolheu. Não usamos cookies de análise nem de publicidade.",
          "O link «Abrir no Google Maps» leva ao site da Google, que aplica a sua própria política de privacidade.",
        ],
      },
      {
        heading: "Os seus direitos",
        blocks: [
          "Pode, a qualquer momento, pedir o acesso, a retificação, o apagamento, a limitação ou a portabilidade dos seus dados, e opor-se ao seu tratamento.",
          byEmail(
            f,
            (email) => `Para isso, basta escrever-nos para ${email}.`,
            "Para isso, basta escrever-nos para a morada indicada acima.",
          ),
          "Se considerar que os seus dados não são tratados corretamente, pode apresentar reclamação à Comissão Nacional de Proteção de Dados (CNPD), em www.cnpd.pt.",
        ],
      },
      {
        heading: "Alterações",
        blocks: [
          "Podemos atualizar esta política. A versão em vigor é sempre a que está publicada neste site, com a data da última atualização.",
        ],
      },
    ],
  },

  terms: {
    title: "Termos e Condições",
    updated: "Última atualização: 6 de novembro de 2026",
    sections: [
      {
        heading: "Quem somos",
        blocks: [
          `O site ${f.domain} e os serviços Clara são da responsabilidade de ${f.identity}. Ao usar o site ou ao pedir um orçamento, aceita estes termos.`,
        ],
      },
      {
        heading: "Serviços",
        blocks: [
          "A Clara presta serviços de limpeza a particulares e empresas em Lisboa e arredores: limpeza doméstica, de escritórios, pós-obra, de vidros, de estofos e de alojamento local, de forma pontual ou regular. As descrições do site são indicativas.",
        ],
      },
      {
        heading: "Orçamentos",
        blocks: [
          "Os pedidos de orçamento são gratuitos e sem compromisso. A estimativa apresentada no site no final do questionário é indicativa e não constitui uma proposta. Cada proposta indica o serviço, o preço, a data e as condições aplicáveis, e só vincula as partes depois de aceite por si e confirmada pela Clara.",
          "Se as condições da proposta aceite forem diferentes destes termos, prevalecem as da proposta.",
        ],
      },
      {
        heading: "Marcação e acesso ao espaço",
        blocks: [
          "Combinamos consigo a data, o horário e a forma de acesso ao espaço. Informe-nos antes da intervenção de qualquer particularidade: materiais delicados, animais, zonas a evitar.",
        ],
      },
      {
        heading: "Alteração e cancelamento",
        blocks: [
          "Pode alterar ou cancelar uma marcação contactando-nos com a maior antecedência possível. Os prazos e eventuais custos de cancelamento são os indicados na proposta.",
        ],
      },
      {
        heading: "Preços e pagamento",
        blocks: [
          "Os preços são os da proposta aceite e incluem IVA à taxa legal, salvo indicação em contrário. O meio e o prazo de pagamento constam da proposta e da fatura.",
        ],
      },
      {
        heading: "Qualidade e responsabilidade",
        blocks: [
          "Realizamos cada serviço com cuidado. Se notar algum problema, informe-nos o mais depressa possível após a intervenção para o podermos resolver.",
          "A Clara não responde por danos resultantes de informações incorretas ou omitidas pelo cliente, nem pelo desgaste já existente dos materiais, sem prejuízo dos direitos que a lei garante aos consumidores.",
        ],
      },
      {
        heading: "Utilização do site",
        blocks: [
          "Os textos, as imagens e a marca Clara estão protegidos e não podem ser reutilizados sem autorização. Procuramos manter a informação do site atualizada, mas ela pode conter imprecisões.",
        ],
      },
      {
        heading: "Reclamações e litígios",
        blocks: [
          "Pode apresentar uma reclamação no Livro de Reclamações Eletrónico, em www.livroreclamacoes.pt.",
          "Em caso de litígio de consumo, pode recorrer a uma entidade de resolução alternativa de litígios, como o Centro de Arbitragem de Conflitos de Consumo de Lisboa (www.centroarbitragemlisboa.pt). Mais informações no Portal do Consumidor, em www.consumidor.gov.pt.",
        ],
      },
      {
        heading: "Lei aplicável",
        blocks: ["Estes termos regem-se pela lei portuguesa."],
      },
    ],
  },
});
