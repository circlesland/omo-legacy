const db = {
  wishes: [
    {
      id: "1",
      title: "Wunsch",
      content: "Regelmäßig zusammen kochen und essen"
    },
    {
      id: "2",
      title: "Wunsch",
      content: "Einmal die Woche Schachspielen"
    },
    {
      id: "3",
      title: "Wunsch",
      content: "Öfters in die Natur spazieren gehen"
    },
    {
      id: "4",
      title: "Wunsch",
      content: "Eine tolle Brieffreundschaft"
    },
    {
      id: "5",
      title: "Wunsch",
      content: "mal wieder richtig zu lachen"
    },
    {
      id: "6",
      title: "Wunsch",
      content: "das Schalke Deutscher Meister wird"
    }
  ],
  schwierigkeiten: [
    {
      id: "1",
      tag: "hören"
    },
    {
      id: "2",
      tag: "sehen"
    },
    {
      id: "3",
      tag: "laufen"
    },
    {
      id: "4",
      tag: "essen"
    },
    {
      id: "5",
      tag: "reden"
    }
  ],
  leidenschaften: [
    {
      id: "1",
      tag: "stricken"
    },
    {
      id: "2",
      tag: "fischen"
    },
    {
      id: "3",
      tag: "kochen"
    },
    {
      id: "4",
      tag: "backen"
    },
    {
      id: "5",
      tag: "schach"
    },
    {
      id: "6",
      tag: "internet"
    },
    {
      id: "7",
      tag: "billiard"
    },
    {
      id: "8",
      tag: "tanzen"
    },
    {
      id: "9",
      tag: "reisen"
    }
  ],
  cities: [
    {
      id: 1,
      name: "Heidelberg",
      image: "https://source.unsplash.com/Yfo3qWK2pjY"
    },
    {
      id: 2,
      name: "Berlin",
      image: "https://source.unsplash.com/TK5I5L5JGxY"
    },
    {
      id: 3,
      name: "Memmingen",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/2/22/Memmingen-Marktplatz.JPG"
    },
    {
      id: 4,
      name: "Neue Stadt gründen",
      image: "/images/addcity.jpg"
    }
  ],
  enkels: [
    {
      id: 0,
      name: "Emma",
      image: "https://source.unsplash.com/rDEOVtE7vOs",
      story:
        "Eines der schönsten Momente meines Lebens habe ich mit Onkel Josef-Dieter gehabt",
      city: 2,
      leidenschaften: [1, 4, 7, 8, 9]
    },
    {
      id: 1,
      name: "Jakob",
      image: "https://source.unsplash.com/7YVZYZeITc8",
      story:
        "Eines der schönsten Momente meines Lebens habe ich mit Onkel Josef-Dieter gehabtf",
      city: 1,
      leidenschaften: [1, 2, 3, 4]
    },
    {
      id: 2,
      name: "Volker",
      image: "https://source.unsplash.com/rriAI0nhcbc",
      story:
        "Eines der schönsten Momente meines Lebens habe ich mit Onkel Josef-Dieter gehabt",
      city: 2,
      leidenschaften: [1, 3, 5, 6, 9]
    },
    {
      id: 3,
      name: "Adele",
      image: "https://source.unsplash.com/xe68QiMaDrQ",
      story:
        "Eines der schönsten Momente meines Lebens habe ich mit Onkel Josef-Dieter gehabt",
      city: 3,
      leidenschaften: [1, 2, 3]
    }
  ],
  dreams: [
    {
      id: 1,
      name: "Oma Erna",
      dream: "als ältester Mensch einen Marathon zu laufen",
      leidenschaften: [5, 4, 3],
      schwierigkeiten: [1, 2],
      wishes: [1, 4, 6],
      color: "bg-ci-2",
      image: "https://source.unsplash.com/y0I85D5QKvs",
      city: 1
    },
    {
      id: 2,
      name: "Tante Inge",
      dream: "noch einmal an die Nordsee zu fahren",
      color: "bg-ci",
      city: 2,
      leidenschaften: [2, 3, 7],
      schwierigkeiten: [3, 4, 5],
      wishes: [2, 5, 3],
      image: "https://source.unsplash.com/MTg6nH8_lOY"
    },

    {
      id: 3,
      name: "Onkel Otto",
      dream: "ins Stadion des Champions League Finales gehen",
      color: "bg-ci-2",
      city: 3,
      leidenschaften: [1, 3, 4, 8],
      schwierigkeiten: [1, 2, 5],
      wishes: [1, 4, 6],
      image: "https://source.unsplash.com/xSOfm3S2QQg"
    }
  ],
  blog: [
    {
      id: 1,
      title: "Alf und Emmy,",
      subtitle: "eine wundersame Begegnung",
      excerpt:
        "Letzte Woche haben sich zum ersten mal zwicshen Alf und Emmy ein Generationen Tandem gebildet. Sie waren gemeinam auf dem Weg zum Schachspielen als es geschah...",
      image: "https://source.unsplash.com/random?sig=123/800x800/",
      cities: [1, 2, 3]
    },
    {
      id: 2,
      title: "Wie alles began,",
      subtitle: "die ersten Tage von Opa Franz",
      excerpt:
        "Peter, Philipp und Samuel hatten eines Tages den Geistesblitz Opa Franz für Memmingen zu entwickeln. Innerhalb von 24 Stunden bauten sie gemeinsam den ersten...",
      image: "https://source.unsplash.com/random?sig=321/800x800/",
      cities: [1, 2, 3]
    }
  ]
};
export default db;
