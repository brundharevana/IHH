// Generated from data/inductees/einstein/media.jsonl, facts.jsonl and ARTIFACTS.md (run
// einstein-docs-2026-10-20) by the tour agent; every line is a verbatim part of a verified fact
// (checked when generated). Page images: app/public/media/einstein/ (WebP from site/public/media).
// EIN-M-0063: pages 2-3 of the holder's PDF (psfa0064.pdf, 787 x 1000 px at 100 ppi, as published),
// assets-src/einstein-photo-rooms/SOURCES.md. EIN-M-0016 is link-only (artifacts.js LINK_ONLY).
// EIN-M-0074 / EIN-M-0075: the two photo rooms' photographs (chapters "Arriving", "Birth"), the LoC
// 1024 px files with the mount cropped (assets-src/einstein-photo-rooms/). EIN-PIPE-RECREATION: the
// labelled recreation of the brier pipe (assets-src/einstein-pipe/): no fact lines.
// Round 7 (2026-10-27): the 1933 newspaper clippings (EIN-M-0077/-0078) and the 1905 Annalen first pages
// (EIN-M-0082/-0083), shown by owner ruling (app/scripts/build_fact_index.py OWNER_RULED); the Gothenburg
// lecture photographs (EIN-M-0079/-0081) and the 1954 IAS study photographs (EIN-M-0030..-0033, -0042),
// verified. Images: assets-src/einstein-records/ (fetch_media.sh, make_media.py).
// Round 7 part D (2026-10-27): each stop narrates its record (record lines, narration chapter 12); EIN-M-0002 and
// EIN-M-0063 no longer carry the fact lines the chapter's opening or panel tells.
// Round 8 (2026-10-28): EIN-M-0074 (a photograph of another occasion) no longer carries the Princeton lines; they
// close the arriving chapter. EIN-M-0050, the first Brunauer letter, carries EIN-F-0063 (what the letters are about).
const D = '/media/einstein'
const page = (w, h) => [0.5 * (w / h), 0.5] // a printed page, shown at 0.5 m high (size not in the record)

export const EINSTEIN_ARTIFACTS = {
  "EIN-M-0050": {
    "id": "EIN-M-0050",
    "slug": "einstein",
    "kind": "letter",
    "title": "Letter to Lieutenant Stephen Brunauer",
    "date": "May 17, 1943",
    "year": 1943,
    "theme": "Science",
    "holder": "National Archives at College Park, Records of the Bureau of Ordnance",
    "catalogueId": "NAID 305247",
    "rights": "Public domain (holder: “Unrestricted”)",
    "source": "https://catalog.archives.gov/id/305247",
    "credit": "National Archives at College Park, Records of the Bureau of Ordnance, NAID 305247.",
    "alt": "Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance, 1943-05-17. It is in regards to Albert Einstein participating in the Research and Development Division of the Navy to research Navy problems.",
    "lines": [
      {
        "label": "Dated",
        "text": "May 17, 1943",
        "factId": "EIN-F-0064"
      },
      {
        "label": "About",
        "text": "participating in the Research and Development Division of the Navy to research Navy problems",
        "factId": "EIN-F-0064"
      },
      {
        "label": "Series",
        "text": "Nine letters were written by Albert Einstein to Lieutenant Stephen Brunauer",
        "factId": "EIN-F-0062"
      },
      {
        "label": "The letters",
        "text": "Albert Einstein's letters to Lieutenant Stephen Brunauer relate to Einstein's research with the Research and Development Division of the Navy, specifically underwater explosions and a proposed electromagnetic torpedo detonator",
        "factId": "EIN-F-0063"
      }
    ],
    "maker": "Albert Einstein",
    "pages": [
      {
        "src": "/media/einstein/EIN-M-0050-p1.webp",
        "sizeM": [
          0.2253,
          0.279
        ],
        "label": "Page 1"
      },
      {
        "src": "/media/einstein/EIN-M-0050-p2.webp",
        "sizeM": [
          0.2229,
          0.279
        ],
        "label": "Page 2"
      }
    ],
    "folds": 3
  },
  "EIN-M-0015": {
    "id": "EIN-M-0015",
    "slug": "einstein",
    "kind": "letter",
    "title": "Letter to Lieutenant Stephen Brunauer",
    "date": "June 18, 1943",
    "year": 1943,
    "theme": "Science",
    "holder": "National Archives at College Park, Records of the Bureau of Ordnance",
    "catalogueId": "NAID 305248",
    "rights": "Public domain (holder: “Unrestricted”)",
    "source": "https://catalog.archives.gov/id/305248",
    "credit": "National Archives at College Park, Records of the Bureau of Ordnance, NAID 305248.",
    "alt": "Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance, 1943-06-18. It discusses Albert Einstein's idea of an electro-magnetic device that will automatically explode a torpedo as it passes underneath a ship.",
    "lines": [
      {
        "label": "Dated",
        "text": "June 18, 1943",
        "factId": "EIN-F-0065"
      },
      {
        "label": "To",
        "text": "Lieutenant Stephen Brunauer",
        "factId": "EIN-F-0065"
      },
      {
        "label": "About",
        "text": "an electro-magnetic device that will automatically explode a torpedo as it passes underneath a ship",
        "factId": "EIN-F-0065"
      },
      {
        "label": "Series",
        "text": "Nine letters were written by Albert Einstein to Lieutenant Stephen Brunauer",
        "factId": "EIN-F-0062"
      }
    ],
    "maker": "Albert Einstein",
    "pages": [
      {
        "src": "/media/einstein/EIN-M-0015-p1.webp",
        "sizeM": [
          0.2164,
          0.279
        ],
        "label": "Page 1"
      },
      {
        "src": "/media/einstein/EIN-M-0015-p2.webp",
        "sizeM": [
          0.2175,
          0.279
        ],
        "label": "Page 2"
      },
      {
        "src": "/media/einstein/EIN-M-0015-p3.webp",
        "sizeM": [
          0.2158,
          0.279
        ],
        "label": "Page 3"
      }
    ],
    "folds": 3,
    "listen": "Hear about this letter",
    "clip": {
      "keys": [
        "einstein:2:c6"
      ],
      "factIds": [
        "EIN-F-0065"
      ]
    }
  },
  "EIN-M-0051": {
    "id": "EIN-M-0051",
    "slug": "einstein",
    "kind": "sheet",
    "title": "Letter to Lieutenant Stephen Brunauer",
    "date": "June 29, 1943",
    "year": 1943,
    "theme": "Science",
    "holder": "National Archives at College Park, Records of the Bureau of Ordnance",
    "catalogueId": "NAID 305249",
    "rights": "Public domain (holder: “Unrestricted”)",
    "source": "https://catalog.archives.gov/id/305249",
    "credit": "National Archives at College Park, Records of the Bureau of Ordnance, NAID 305249.",
    "alt": "Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance, 1943-06-29. In it, Albert Einstein answers a letter from the same day, and says that he will not be able to come to Washington, DC for health reasons.",
    "lines": [
      {
        "label": "Dated",
        "text": "June 29, 1943",
        "factId": "EIN-F-0066"
      },
      {
        "label": "About",
        "text": "he will not be able to come to Washington, DC for health reasons",
        "factId": "EIN-F-0066"
      },
      {
        "label": "Series",
        "text": "Nine letters were written by Albert Einstein to Lieutenant Stephen Brunauer",
        "factId": "EIN-F-0062"
      }
    ],
    "maker": "Albert Einstein",
    "pages": [
      {
        "src": "/media/einstein/EIN-M-0051-p1.webp",
        "sizeM": [
          0.2173,
          0.279
        ],
        "label": "Page 1"
      }
    ]
  },
  "EIN-M-0052": {
    "id": "EIN-M-0052",
    "slug": "einstein",
    "kind": "sheet",
    "title": "Letter to Lieutenant Stephen Brunauer",
    "date": "July 30, 1943",
    "year": 1943,
    "theme": "Science",
    "holder": "National Archives at College Park, Records of the Bureau of Ordnance",
    "catalogueId": "NAID 305250",
    "rights": "Public domain (holder: “Unrestricted”)",
    "source": "https://catalog.archives.gov/id/305250",
    "credit": "National Archives at College Park, Records of the Bureau of Ordnance, NAID 305250.",
    "alt": "Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance, 1943-07-30. In it, Albert Einstein reveals that he has come up with a mathematical simplification to analyze the impact an underwater explosion would have on the hull of an armored ship.",
    "lines": [
      {
        "label": "Dated",
        "text": "July 30, 1943",
        "factId": "EIN-F-0067"
      },
      {
        "label": "About",
        "text": "a mathematical simplification to analyze the impact an underwater explosion would have on the hull of an armored ship",
        "factId": "EIN-F-0067"
      },
      {
        "label": "Series",
        "text": "Nine letters were written by Albert Einstein to Lieutenant Stephen Brunauer",
        "factId": "EIN-F-0062"
      }
    ],
    "maker": "Albert Einstein",
    "pages": [
      {
        "src": "/media/einstein/EIN-M-0052-p1.webp",
        "sizeM": [
          0.2203,
          0.279
        ],
        "label": "Page 1"
      }
    ],
    "clip": {
      "keys": [
        "einstein:2:c7"
      ],
      "factIds": [
        "EIN-F-0067"
      ]
    }
  },
  "EIN-M-0053": {
    "id": "EIN-M-0053",
    "slug": "einstein",
    "kind": "sheet",
    "title": "Letter to Lieutenant Stephen Brunauer",
    "date": "August 13, 1943",
    "year": 1943,
    "theme": "Immigration & Migration",
    "holder": "National Archives at College Park, Records of the Bureau of Ordnance",
    "catalogueId": "NAID 305251",
    "rights": "Public domain (holder: “Unrestricted”)",
    "source": "https://catalog.archives.gov/id/305251",
    "credit": "National Archives at College Park, Records of the Bureau of Ordnance, NAID 305251.",
    "alt": "Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance, 1943-08-13. In it, Dr. Einstein mentions an offer from Dr. Vannever Bush to accept an appointment as a consultant to Division 8 of the National Research Committee.",
    "lines": [
      {
        "label": "Dated",
        "text": "August 13, 1943",
        "factId": "EIN-F-0068"
      },
      {
        "label": "Offer",
        "text": "an offer from Dr. Vannever Bush to accept an appointment as a consultant to Division 8 of the National Research Committee",
        "factId": "EIN-F-0068"
      },
      {
        "label": "Enclosed",
        "text": "Signed copies of a contract and naturalization papers were enclosed",
        "factId": "EIN-F-0069"
      },
      {
        "label": "Series",
        "text": "Nine letters were written by Albert Einstein to Lieutenant Stephen Brunauer",
        "factId": "EIN-F-0062"
      }
    ],
    "maker": "Albert Einstein",
    "pages": [
      {
        "src": "/media/einstein/EIN-M-0053-p1.webp",
        "sizeM": [
          0.2172,
          0.279
        ],
        "label": "Page 1"
      }
    ],
    "clip": {
      "keys": [
        "einstein:2:c8"
      ],
      "factIds": [
        "EIN-F-0069"
      ]
    }
  },
  "EIN-M-0054": {
    "id": "EIN-M-0054",
    "slug": "einstein",
    "kind": "document",
    "title": "Letter to Lieutenant Stephen Brunauer",
    "date": "August 22, 1943",
    "year": 1943,
    "theme": "Science",
    "holder": "National Archives at College Park, Records of the Bureau of Ordnance",
    "catalogueId": "NAID 305252",
    "rights": "Public domain (holder: “Unrestricted”)",
    "source": "https://catalog.archives.gov/id/305252",
    "credit": "National Archives at College Park, Records of the Bureau of Ordnance, NAID 305252.",
    "alt": "Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance, 1943-08-22. In it, Albert Einstein gives his opinion on the best localization for installation of the torpedo explosion.",
    "lines": [
      {
        "label": "Dated",
        "text": "August 22, 1943",
        "factId": "EIN-F-0070"
      },
      {
        "label": "About",
        "text": "the best localization for installation of the torpedo explosion",
        "factId": "EIN-F-0070"
      },
      {
        "label": "Series",
        "text": "Nine letters were written by Albert Einstein to Lieutenant Stephen Brunauer",
        "factId": "EIN-F-0062"
      }
    ],
    "maker": "Albert Einstein",
    "pages": [
      {
        "src": "/media/einstein/EIN-M-0054-p1.webp",
        "sizeM": [
          0.2042,
          0.279
        ],
        "label": "Page 1"
      },
      {
        "src": "/media/einstein/EIN-M-0054-p2.webp",
        "sizeM": [
          0.2033,
          0.279
        ],
        "label": "Page 2"
      }
    ]
  },
  "EIN-M-0055": {
    "id": "EIN-M-0055",
    "slug": "einstein",
    "kind": "sheet",
    "title": "Letter to Lieutenant Stephen Brunauer",
    "date": "September 1, 1943",
    "year": 1943,
    "theme": "Science",
    "holder": "National Archives at College Park, Records of the Bureau of Ordnance",
    "catalogueId": "NAID 305253",
    "rights": "Public domain (holder: “Unrestricted”)",
    "source": "https://catalog.archives.gov/id/305253",
    "credit": "National Archives at College Park, Records of the Bureau of Ordnance, NAID 305253.",
    "alt": "Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance, 1943-09-01. In it, Albert Einstein discusses the need to carry out experiments, as he will not be able to progress any further in the problem through mathematical calculation.",
    "lines": [
      {
        "label": "Dated",
        "text": "September 1, 1943",
        "factId": "EIN-F-0071"
      },
      {
        "label": "About",
        "text": "the need to carry out experiments, as he will not be able to progress any further in the problem through mathematical calculation",
        "factId": "EIN-F-0071"
      },
      {
        "label": "Series",
        "text": "Nine letters were written by Albert Einstein to Lieutenant Stephen Brunauer",
        "factId": "EIN-F-0062"
      }
    ],
    "maker": "Albert Einstein",
    "pages": [
      {
        "src": "/media/einstein/EIN-M-0055-p1.webp",
        "sizeM": [
          0.2161,
          0.279
        ],
        "label": "Page 1"
      }
    ]
  },
  "EIN-M-0056": {
    "id": "EIN-M-0056",
    "slug": "einstein",
    "kind": "document",
    "title": "Letter to Lieutenant Stephen Brunauer",
    "date": "January 4, 1944",
    "year": 1944,
    "theme": "Science",
    "holder": "National Archives at College Park, Records of the Bureau of Ordnance",
    "catalogueId": "NAID 305254",
    "rights": "Public domain (holder: “Unrestricted”)",
    "source": "https://catalog.archives.gov/id/305254",
    "credit": "National Archives at College Park, Records of the Bureau of Ordnance, NAID 305254.",
    "alt": "Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance, 1944-01-04. It discusses Albert Einstein's idea to have a torpedo positioned parallel to the wall of a ship before it exploded.",
    "lines": [
      {
        "label": "Dated",
        "text": "January 4, 1944",
        "factId": "EIN-F-0072"
      },
      {
        "label": "Idea",
        "text": "to have a torpedo positioned parallel to the wall of a ship before it exploded",
        "factId": "EIN-F-0072"
      },
      {
        "label": "Result",
        "text": "the idea of a torpedo positioned parallel to the wall of a ship proved impossible",
        "factId": "EIN-F-0073"
      },
      {
        "label": "Series",
        "text": "Nine letters were written by Albert Einstein to Lieutenant Stephen Brunauer",
        "factId": "EIN-F-0062"
      }
    ],
    "maker": "Albert Einstein",
    "pages": [
      {
        "src": "/media/einstein/EIN-M-0056-p1.webp",
        "sizeM": [
          0.2023,
          0.279
        ],
        "label": "Page 1"
      },
      {
        "src": "/media/einstein/EIN-M-0056-p2.webp",
        "sizeM": [
          0.2014,
          0.279
        ],
        "label": "Page 2"
      }
    ]
  },
  "EIN-M-0057": {
    "id": "EIN-M-0057",
    "slug": "einstein",
    "kind": "sheet",
    "title": "Letter to Lieutenant Stephen Brunauer",
    "date": "October 15, 1944",
    "year": 1944,
    "theme": "Science",
    "holder": "National Archives at College Park, Records of the Bureau of Ordnance",
    "catalogueId": "NAID 305255",
    "rights": "Public domain (holder: “Unrestricted”)",
    "source": "https://catalog.archives.gov/id/305255",
    "credit": "National Archives at College Park, Records of the Bureau of Ordnance, NAID 305255.",
    "alt": "Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance, 1944-10-15. It discusses quick compression in a metal container.",
    "lines": [
      {
        "label": "Dated",
        "text": "October 15, 1944",
        "factId": "EIN-F-0074"
      },
      {
        "label": "About",
        "text": "quick compression in a metal container",
        "factId": "EIN-F-0074"
      },
      {
        "label": "Series",
        "text": "Nine letters were written by Albert Einstein to Lieutenant Stephen Brunauer",
        "factId": "EIN-F-0062"
      }
    ],
    "maker": "Albert Einstein",
    "pages": [
      {
        "src": "/media/einstein/EIN-M-0057-p1.webp",
        "sizeM": [
          0.2017,
          0.279
        ],
        "label": "Page 1"
      }
    ]
  },
  "EIN-M-0013": {
    "id": "EIN-M-0013",
    "slug": "einstein",
    "kind": "photo",
    "title": "Dr. Albert Einstein With Lieutenant (jg) Clifford L. Comstock",
    "date": "24 July 1943",
    "year": 1943,
    "theme": "Science",
    "holder": "National Archives at College Park - Still Pictures, General Records of the Department of the Navy",
    "catalogueId": "80-G-42918 (NAID 276538325)",
    "rights": "Public domain (holder: “Unrestricted”)",
    "source": "https://catalog.archives.gov/id/276538325",
    "credit": "National Archives at College Park - Still Pictures, General Records of the Department of the Navy, 80-G-42918 (NAID 276538325).",
    "alt": "Dr. Albert Einstein, who is doing research for the Bureau of Ordnance, in his study at Princeton, N.J. Lieut (jg) Clifford L. Comstock; USNR, a student officer at NTS Princeton, at left. 24 July 1943.",
    "lines": [
      {
        "label": "Shows",
        "text": "Dr. Albert Einstein is doing research for the Bureau of Ordnance, in his study at Princeton, N.J.",
        "factId": "EIN-F-0055"
      }
    ],
    "photos": [
      {
        "src": "/media/einstein/EIN-M-0013.webp",
        "label": "Photograph"
      }
    ]
  },
  "EIN-M-0014": {
    "id": "EIN-M-0014",
    "slug": "einstein",
    "kind": "photo",
    "title": "Dr. Albert Einstein With Captain Geoffrey E. Sage",
    "date": "24 July 1943",
    "year": 1943,
    "theme": "Science",
    "holder": "National Archives at College Park - Still Pictures, General Records of the Department of the Navy",
    "catalogueId": "80-G-42919 (NAID 276538328)",
    "rights": "Public domain (holder: “Unrestricted”)",
    "source": "https://catalog.archives.gov/id/276538328",
    "credit": "National Archives at College Park - Still Pictures, General Records of the Department of the Navy, 80-G-42919 (NAID 276538328).",
    "alt": "Dr. Albert Einstein, who is doing research for the Bureau of Ordnance, in his study at Princeton, N.J. Capt. Geoffrey E. Sage, USN, Commanding Officer, NTS, Princeton, and Lieut. Comdr. Frederick L. Douthit, USNR, Executive Officer, at left. 24 July 1943.",
    "lines": [
      {
        "label": "Shows",
        "text": "Dr. Albert Einstein is doing research for the Bureau of Ordnance, in his study at Princeton, N.J.",
        "factId": "EIN-F-0055"
      }
    ],
    "photos": [
      {
        "src": "/media/einstein/EIN-M-0014.webp",
        "label": "Photograph"
      }
    ]
  },
  "EIN-M-0059": {
    "id": "EIN-M-0059",
    "slug": "einstein",
    "kind": "photo",
    "title": "Dr. Albert Einstein at Princeton, N.J. Where He is Engaged in Research Work for the U.S. Navy",
    "date": "1 Sept. 1943",
    "year": 1943,
    "theme": "Science",
    "holder": "National Archives at College Park - Still Pictures, General Records of the Department of the Navy",
    "catalogueId": "80-G-42917 (NAID 276538322)",
    "rights": "Public domain (holder: “Unrestricted”)",
    "source": "https://catalog.archives.gov/id/276538322",
    "credit": "National Archives at College Park - Still Pictures, General Records of the Department of the Navy, 80-G-42917 (NAID 276538322).",
    "alt": "Dr. Albert Einstein at Princeton, N.J. where he is engaged in research work for the U.S. Navy. 1 Sept. 1943.",
    "lines": [
      {
        "label": "Dated",
        "text": "On 1 Sept. 1943, Dr. Albert Einstein at Princeton, N.J. is engaged in research work for the U.S. Navy.",
        "factId": "EIN-F-0138"
      }
    ],
    "photos": [
      {
        "src": "/media/einstein/EIN-M-0059.webp",
        "label": "Photograph"
      }
    ]
  },
  "EIN-M-0019": {
    "id": "EIN-M-0019",
    "slug": "einstein",
    "kind": "document",
    "title": "Declaration of Intention and Petition for Naturalization for Albert Einstein",
    "date": "1936-01-15",
    "year": 1936,
    "theme": "Immigration & Migration",
    "holder": "National Archives at Philadelphia, Records of District Courts of the United States",
    "catalogueId": "NAID 596270",
    "rights": "Public domain (holder: “Unrestricted”)",
    "source": "https://catalog.archives.gov/id/596270",
    "credit": "National Archives at Philadelphia, Records of District Courts of the United States, NAID 596270.",
    "alt": "Record of naturalization for Albert Einstein which includes a Certificate of Arrival, Declaration of Intention, Petition for Naturalization, and Oath of Allegiance.",
    "lines": [
      {
        "label": "Declared",
        "text": "The Declaration of Intention for Albert Einstein is from 1936-01-15.",
        "factId": "EIN-F-0045"
      },
      {
        "label": "Photograph",
        "text": "A photograph of Albert Einstein is affixed to the Declaration of Intention.",
        "factId": "EIN-F-0057"
      },
      {
        "label": "Petition",
        "text": "petition number 4009, assigned by the U.S. District Court for the District of New Jersey, Trenton",
        "factId": "EIN-F-0056"
      },
      {
        "label": "Record",
        "text": "The record of naturalization for Albert Einstein at the National Archives at Philadelphia includes a Certificate of Arrival, Declaration of Intention, Petition for Naturalization, and Oath of Allegiance.",
        "factId": "EIN-F-0001"
      }
    ],
    "pages": [
      {
        "src": "/media/einstein/EIN-M-0019-p1.webp",
        "sizeM": [
          0.5115,
          0.279
        ],
        "label": "Page 1"
      },
      {
        "src": "/media/einstein/EIN-M-0019-p2.webp",
        "sizeM": [
          0.2252,
          0.279
        ],
        "label": "Page 2"
      },
      {
        "src": "/media/einstein/EIN-M-0019-p3.webp",
        "sizeM": [
          0.2159,
          0.279
        ],
        "label": "Page 3"
      },
      {
        "src": "/media/einstein/EIN-M-0019-p4.webp",
        "sizeM": [
          0.2159,
          0.279
        ],
        "label": "Page 4"
      }
    ],
    "clip": {
      "keys": [
        "einstein:1:c5",
        "einstein:1:c6"
      ],
      "factIds": [
        "EIN-F-0045",
        "EIN-F-0057"
      ]
    }
  },
  "EIN-M-0002": {
    "id": "EIN-M-0002",
    "slug": "einstein",
    "kind": "photo",
    "title": "America gains a famous citizen",
    "date": "1940 Oct. 1",
    "year": 1940,
    "theme": "Immigration & Migration",
    "holder": "Library of Congress, Prints & Photographs Division",
    "catalogueId": "LC-DIG-ppmsca-05649",
    "rights": "No known copyright restriction. For information see \"New York World-Telegram & ...,\" https://www.loc.gov/rr/print/res/076_nyw.html",
    "source": "https://www.loc.gov/item/2004672481/",
    "credit": "Library of Congress, Prints & Photographs Division, NYWT&S Collection, LC-DIG-ppmsca-05649. Photo by Al. Aumuller.",
    "alt": "Photograph shows Albert Einstein receiving from Judge Phillip Forman his certificate of American citizenship.",
    "lines": [
      {
        "label": "Dated",
        "text": "On 1940 Oct. 1",
        "factId": "EIN-F-0051"
      },
      {
        "label": "Shows",
        "text": "Albert Einstein was photographed receiving from Judge Phillip Forman his certificate of American citizenship",
        "factId": "EIN-F-0051"
      }
    ],
    "maker": "Photo by Al. Aumuller",
    "photos": [
      {
        "src": "/media/einstein/EIN-M-0002.webp",
        "label": "Photograph"
      }
    ],
    "listen": "Hear about this photograph"
  },
  "EIN-M-0063": {
    "id": "EIN-M-0063",
    "slug": "einstein",
    "kind": "document",
    "title": "Letter from Albert Einstein to President Franklin D. Roosevelt",
    "date": "8/2/1939",
    "year": 1939,
    "theme": "Science",
    "holder": "Franklin D. Roosevelt Library, Hyde Park, NY",
    "catalogueId": "National Archives Identifier 16608874",
    "rights": "Public Domain, Free of Known Copyright Restrictions",
    "source": "https://docsteach.org/document/letter-from-albert-einstein-to-president-franklin-d-roosevelt/",
    "credit": "Franklin D. Roosevelt Library, Hyde Park, NY; President's Secretary's File (Franklin D. Roosevelt Administration), Safe Files, Sachs, Alexander; National Archives Identifier 16608874 (DocsTeach, National Archives Foundation).",
    "alt": "Letter from Albert Einstein to President Franklin D. Roosevelt; 8/2/1939; Sachs, Alexander; Franklin D. Roosevelt Library, Hyde Park, NY.",
    "lines": [
      {
        "label": "Signed",
        "text": "Albert Einstein signed a letter to President Roosevelt.",
        "factId": "EIN-F-0110"
      },
      {
        "label": "Delivered",
        "text": "Alexander Sachs delivered Einstein's letter to President Roosevelt on October 11, 1939.",
        "factId": "EIN-F-0135"
      }
    ],
    "maker": "Albert Einstein",
    "pages": [
      {
        "src": "/media/einstein/EIN-M-0063-p1.webp",
        "sizeM": [
          0.2196,
          0.279
        ],
        "label": "Page 1"
      },
      {
        "src": "/media/einstein/EIN-M-0063-p2.webp",
        "sizeM": [
          0.2226,
          0.279
        ],
        "label": "Page 2"
      }
    ],
    "listen": "Hear about this letter"
  },
  "EIN-M-0016": {
    "id": "EIN-M-0016",
    "slug": "einstein",
    "kind": "document",
    "title": "Letter from Albert Einstein and the Emergency Committee of Atomic Scientists",
    "date": "1947-11-29",
    "year": 1947,
    "theme": "Science",
    "holder": "National Archives at College Park",
    "catalogueId": "NAID 7873451",
    "rights": "Public domain (holder: “Unrestricted”)",
    "source": "https://catalog.archives.gov/id/7873451",
    "credit": "National Archives at College Park, NAID 7873451.",
    "alt": "Letter, 5 sheets, 1947-11-29, in which Albert Einstein writes as Chairman of the Emergency Committee of Atomic Scientists discussing the issue of international atomic energy control.",
    "lines": [
      {
        "label": "About",
        "text": "In a letter of November 29, 1947, Albert Einstein writes as Chairman of the Emergency Committee of Atomic Scientists discussing the issue of international atomic energy control.",
        "factId": "EIN-F-0075"
      }
    ],
    "maker": "Albert Einstein",
    "pages": []
  },
  "EIN-M-0074": {
    "id": "EIN-M-0074",
    // the photo room built from this photograph (its files: the projected photo, the filled plate, the proxy masks); a
    // place's photo room reads its files from here (artifacts.js backdropOf), never from the tour data
    "backdrop": { "photo": "/rooms/einstein/battery-photo.webp", "plate": "/rooms/einstein/battery-plate.webp", "mask": "/rooms/einstein/battery-mask.webp" },
    "slug": "einstein",
    "kind": "photo",
    "title": "World War veterans leaving the Battery in a drizzling rain this morning for dollar-a-day jobs at government's reforestation camp at Fort Slocum",
    "date": "1933",
    "year": 1933,
    "theme": "Immigration & Migration",
    "holder": "Library of Congress, Prints & Photographs Division, New York World-Telegram & Sun collection",
    "catalogueId": "LoC 2002709322",
    "rights": "No known copyright restriction",
    "source": "https://www.loc.gov/item/2002709322/",
    "credit": "New York World-Telegram & Sun staff photographer, Library of Congress Prints and Photographs Division",
    "alt": "World War veterans leaving the Battery in a drizzling rain for dollar-a-day jobs at government's reforestation camp at Fort Slocum; by World-Telegram staff photographer, 1933.",
    "maker": "World-Telegram staff photographer",
    "lines": [
      {
        "label": "The place",
        "text": "On October 17, 1933, the Einstein party landed at the Battery in New York.",
        "factId": "EIN-F-0124"
      }
    ],
    "photos": [
      {
        "src": "/media/einstein/EIN-M-0074.webp",
        "label": "Photograph"
      }
    ]
  },
  "EIN-M-0075": {
    "id": "EIN-M-0075",
    // the photo room built from this photograph (its files: the projected photo, the filled plate, the proxy masks); a
    // place's photo room reads its files from here (artifacts.js backdropOf), never from the tour data
    "backdrop": { "photo": "/rooms/einstein/ulm-photo.webp", "plate": "/rooms/einstein/ulm-plate.webp", "mask": "/rooms/einstein/ulm-mask.webp" },
    "slug": "einstein",
    "kind": "photo",
    "title": "[Ulm, Wurtemburg, Germany]",
    "date": "between ca. 1890 and ca. 1900",
    "year": 1890,
    "theme": "Immigration & Migration",
    "holder": "Library of Congress, Prints & Photographs Division, Photochrom print collection",
    "catalogueId": "LoC 2002720824",
    "rights": "No known restrictions on publication",
    "source": "https://www.loc.gov/item/2002720824/",
    "credit": "Detroit Publishing Co., Photochrom print collection, Library of Congress Prints and Photographs Division",
    "alt": "[Ulm, Wurtemburg, Germany], photochrom print, between ca. 1890 and ca. 1900.",
    "maker": "Detroit Publishing Co.",
    "lines": [
      {
        "label": "Born",
        "text": "Albert Einstein was born 14 March 1879 in Ulm, Germany.",
        "factId": "EIN-F-0005"
      }
    ],
    "photos": [
      {
        "src": "/media/einstein/EIN-M-0075.webp",
        "label": "Photochrom"
      }
    ]
  },
  "EIN-M-0078": {
    "id": "EIN-M-0078",
    "slug": "einstein",
    "kind": "document",
    "title": "Einstein Is to Renounce Citizenship",
    "date": "March 30, 1933",
    "year": 1933,
    "theme": "Immigration & Migration",
    "holder": "Library of Congress, Chronicling America",
    "catalogueId": "sn83045499, 1933-03-30, page sequence 1",
    "rights": "Public domain (owner ruling 2026-10-27; holder: “The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions.”)",
    "source": "https://www.loc.gov/resource/sn83045499/1933-03-30/ed-1/?sp=1",
    "credit": "Library of Congress, Chronicling America; The daily Alaska empire, March 30, 1933",
    "alt": "Item in The daily Alaska empire, March 30, 1933: Prof. Einstein landed in Brussels from his trip to the United States (EIN-F-0154).",
    "lines": [
      {
        "label": "Reported",
        "text": "Prof. Einstein landed in Brussels from his trip to the United States.",
        "factId": "EIN-F-0154"
      }
    ],
    "maker": "The daily Alaska empire (Juneau, Alaska)",
    "pages": [
      {
        "src": "/media/einstein/EIN-M-0078.webp",
        "sizeM": [
          0.2366,
          0.42
        ],
        "label": "Page 1"
      }
    ]
  },
  "EIN-M-0077": {
    "id": "EIN-M-0077",
    "slug": "einstein",
    "kind": "document",
    "title": "Einstein Renounces German Citizenship",
    "date": "March 31, 1933",
    "year": 1933,
    "theme": "Immigration & Migration",
    "holder": "Library of Congress, Chronicling America",
    "catalogueId": "sn84020097, 1933-03-31, page sequence 4",
    "rights": "Public domain (owner ruling 2026-10-27; holder: “The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions.”)",
    "source": "https://www.loc.gov/resource/sn84020097/1933-03-31/ed-1/?sp=4",
    "credit": "Library of Congress, Chronicling America; The daily worker, March 31, 1933",
    "alt": "Newspaper item in The daily worker, March 31, 1933: Albert Einstein informed the German Consulate in Brussels that he is renouncing his German citizenship (EIN-F-0153).",
    "lines": [
      {
        "label": "Reported",
        "text": "Albert Einstein informed the German Consulate in Brussels that he is renouncing his German citizenship.",
        "factId": "EIN-F-0153"
      }
    ],
    "maker": "The daily worker (Chicago, Ill.; New York, N.Y.)",
    "pages": [
      {
        "src": "/media/einstein/EIN-M-0077.webp",
        "sizeM": [
          0.4709,
          0.42
        ],
        "label": "Page 4"
      }
    ]
  },
  "EIN-M-0079": {
    "id": "EIN-M-0079",
    "slug": "einstein",
    "kind": "photo",
    "title": "Albert Einstein, Nobel Prize lecture, Kongresshallen, Gothenburg, July 11, 1923",
    "date": "July 11, 1923",
    "year": 1923,
    "theme": "Science",
    "holder": "Göteborgs stadsmuseum",
    "catalogueId": "GhmF:149",
    "rights": "Public domain (holder: “Public Domain Mark”; owner ruling 2026-10-27)",
    "source": "https://samlingar.goteborgsstadsmuseum.se/carlotta/web/object/402049",
    "credit": "Göteborgs stadsmuseum, GhmF:149. Photo: Anders Wilhelm Karnell (1871-1934). Public Domain Mark.",
    "alt": "Albert Einstein lectures to the Nordic Assembly of Naturalists in the Kongresshallen, Gothenburg, July 11, 1923; King Gustaf was among those present (EIN-F-0151).",
    "lines": [
      {
        "label": "The address",
        "text": "Einstein delivered an address at Gottenberg, Sweden, before a scientific body on his theory of relativity.",
        "factId": "EIN-F-0150"
      },
      {
        "label": "Present",
        "text": "King Gustaf was among those present at Einstein's address at Gottenberg, Sweden.",
        "factId": "EIN-F-0151"
      }
    ],
    "maker": "Anders Wilhelm Karnell",
    "photos": [
      {
        "src": "/media/einstein/EIN-M-0079.webp",
        "label": "Photograph"
      }
    ],
    "links": [
      {
        "label": "The Nobel lecture at NobelPrize.org",
        "href": "https://www.nobelprize.org/prizes/physics/1921/einstein/lecture/"
      }
    ]
  },
  "EIN-M-0081": {
    "id": "EIN-M-0081",
    "slug": "einstein",
    "kind": "photo",
    "title": "Albert Einstein, Nobel Prize lecture, Kongresshallen, Gothenburg, July 11, 1923",
    "date": "July 11, 1923",
    "year": 1923,
    "theme": "Science",
    "holder": "Göteborgs stadsmuseum",
    "catalogueId": "GhmF:148",
    "rights": "Public domain (holder: “Public Domain Mark”; owner ruling 2026-10-27)",
    "source": "https://samlingar.goteborgsstadsmuseum.se/carlotta/web/object/402044",
    "credit": "Göteborgs stadsmuseum, GhmF:148. Photo: Anders Wilhelm Karnell (1871-1934). Public Domain Mark.",
    "alt": "Albert Einstein lectures to the Nordic Assembly of Naturalists in the Kongresshallen, Gothenburg, July 11, 1923; King Gustaf was among those present (EIN-F-0151).",
    "lines": [
      {
        "label": "The address",
        "text": "Einstein delivered an address at Gottenberg, Sweden, before a scientific body on his theory of relativity.",
        "factId": "EIN-F-0150"
      },
      {
        "label": "Present",
        "text": "King Gustaf was among those present at Einstein's address at Gottenberg, Sweden.",
        "factId": "EIN-F-0151"
      }
    ],
    "maker": "Anders Wilhelm Karnell",
    "photos": [
      {
        "src": "/media/einstein/EIN-M-0081.webp",
        "label": "Photograph"
      }
    ]
  },
  "EIN-M-0082": {
    "id": "EIN-M-0082",
    "slug": "einstein",
    "kind": "document",
    "title": "Zur Elektrodynamik bewegter Körper",
    "date": "1905",
    "year": 1905,
    "theme": "Science",
    "holder": "Internet Archive (scan); HathiTrust (rights for the volume)",
    "catalogueId": "Annalen der Physik und Chemie 1905: Vol 17 Iss 5",
    "rights": "Public domain (owner ruling 2026-10-27; HathiTrust: “pdus”)",
    "source": "https://archive.org/details/sim_annalen-der-physik_1905_17_5/page/890",
    "credit": "Annalen der Physik, 4. Folge, Bd. 17 (1905), S. 891. Scan: Internet Archive (Serials in Microfilm). Rights: HathiTrust, pdus (public domain in the US), volume ser.4 v.17.",
    "alt": "Albert Einstein's special theory of relativity is from 1905 (EIN-F-0156): the first page of A. Einstein, Zur Elektrodynamik bewegter Körper, in Annalen der Physik und Chemie 1905, Vol 17.",
    "lines": [
      {
        "label": "1905",
        "text": "Albert Einstein's special theory of relativity is from 1905.",
        "factId": "EIN-F-0156"
      }
    ],
    "maker": "A. Einstein",
    "pages": [
      {
        "src": "/media/einstein/EIN-M-0082.webp",
        "sizeM": [
          0.2637,
          0.42
        ],
        "label": "First page"
      }
    ]
  },
  "EIN-M-0083": {
    "id": "EIN-M-0083",
    "slug": "einstein",
    "kind": "document",
    "title": "Über einen die Erzeugung und Verwandlung des Lichtes betreffenden heuristischen Gesichtspunkt",
    "date": "1905",
    "year": 1905,
    "theme": "Science",
    "holder": "Internet Archive (scan); HathiTrust (rights for the volume)",
    "catalogueId": "Annalen der Physik und Chemie 1905: Vol 17 Iss 1",
    "rights": "Public domain (owner ruling 2026-10-27; HathiTrust: “pdus”)",
    "source": "https://archive.org/details/sim_annalen-der-physik_1905_17_1/page/132",
    "credit": "Annalen der Physik, 4. Folge, Bd. 17 (1905), S. 132. Scan: Internet Archive (Serials in Microfilm). Rights: HathiTrust, pdus (public domain in the US), volume ser.4 v.17.",
    "alt": "The first page of A. Einstein, Über einen die Erzeugung und Verwandlung des Lichtes betreffenden heuristischen Gesichtspunkt, in Annalen der Physik und Chemie 1905, Vol 17.",
    "lines": [],
    "maker": "A. Einstein",
    "pages": [
      {
        "src": "/media/einstein/EIN-M-0083.webp",
        "sizeM": [
          0.2721,
          0.42
        ],
        "label": "First page"
      }
    ]
  },
  "EIN-M-0030": {
    "id": "EIN-M-0030",
    "slug": "einstein",
    "kind": "photo",
    "title": "Albert Einstein in study, seated",
    "date": "1954",
    "year": 1954,
    "theme": "Immigration & Migration",
    "holder": "Shelby White and Leon Levy Archives Center, Institute for Advanced Study",
    "catalogueId": "E 30",
    "rights": "CC BY 4.0",
    "source": "https://albert.ias.edu/entities/archivalmaterial/41b4e02c-4c2d-40d9-a7dd-42c21d5a0916",
    "credit": "Alan Richards, photographer. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA (E 30). CC BY 4.0.",
    "alt": "Albert Einstein seated in his home office at 112 Mercer Street, Princeton, New Jersey.",
    "lines": [
      {
        "label": "The study",
        "text": "Albert Einstein had a home study at 112 Mercer Street, Princeton, New Jersey.",
        "factId": "EIN-F-0087"
      }
    ],
    "maker": "Alan Richards, photographer",
    "photos": [
      {
        "src": "/media/einstein/EIN-M-0030.webp",
        "label": "Photograph"
      }
    ]
  },
  "EIN-M-0033": {
    "id": "EIN-M-0033",
    "slug": "einstein",
    "kind": "photo",
    "title": "Albert Einstein in study, looking out window",
    "date": "1954",
    "year": 1954,
    "theme": "Immigration & Migration",
    "holder": "Shelby White and Leon Levy Archives Center, Institute for Advanced Study",
    "catalogueId": "E 11",
    "rights": "CC BY 4.0",
    "source": "https://albert.ias.edu/entities/archivalmaterial/1053d45a-e966-4304-a5fa-69de8e0b6fc9",
    "credit": "Alan Richards, photographer. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA (E 11). CC BY 4.0.",
    "alt": "Albert Einstein looking out the window of his home study at 112 Mercer Street, Princeton, New Jersey.",
    "lines": [
      {
        "label": "The study",
        "text": "Albert Einstein had a home study at 112 Mercer Street, Princeton, New Jersey.",
        "factId": "EIN-F-0087"
      }
    ],
    "maker": "Alan Richards, photographer",
    "photos": [
      {
        "src": "/media/einstein/EIN-M-0033.webp",
        "label": "Photograph"
      }
    ]
  },
  "EIN-M-0031": {
    "id": "EIN-M-0031",
    "slug": "einstein",
    "kind": "photo",
    "title": "Albert Einstein in study, standing",
    "date": "1954",
    "year": 1954,
    "theme": "Immigration & Migration",
    "holder": "Shelby White and Leon Levy Archives Center, Institute for Advanced Study",
    "catalogueId": "E 03",
    "rights": "CC BY 4.0",
    "source": "https://albert.ias.edu/entities/archivalmaterial/08bd71e1-b97e-4140-af9c-3f452b361d7e",
    "credit": "Alan Richards, photographer. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA (E 03). CC BY 4.0.",
    "alt": "Albert Einstein standing in his home study at 112 Mercer Street, Princeton, New Jersey.",
    "lines": [
      {
        "label": "The study",
        "text": "Albert Einstein had a home study at 112 Mercer Street, Princeton, New Jersey.",
        "factId": "EIN-F-0087"
      }
    ],
    "maker": "Alan Richards, photographer",
    "photos": [
      {
        "src": "/media/einstein/EIN-M-0031.webp",
        "label": "Photograph"
      }
    ]
  },
  "EIN-M-0032": {
    "id": "EIN-M-0032",
    "slug": "einstein",
    "kind": "photo",
    "title": "Albert Einstein in study, seated",
    "date": "1954",
    "year": 1954,
    "theme": "Immigration & Migration",
    "holder": "Shelby White and Leon Levy Archives Center, Institute for Advanced Study",
    "catalogueId": "E 04",
    "rights": "CC BY 4.0",
    "source": "https://albert.ias.edu/entities/archivalmaterial/c446682d-91a2-4db0-9f4f-f81ca92c79ac",
    "credit": "Alan Richards, photographer. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA (E 04). CC BY 4.0.",
    "alt": "Albert Einstein seated in his home study at 112 Mercer Street, Princeton, New Jersey.",
    "lines": [
      {
        "label": "The study",
        "text": "Albert Einstein had a home study at 112 Mercer Street, Princeton, New Jersey.",
        "factId": "EIN-F-0087"
      }
    ],
    "maker": "Alan Richards, photographer",
    "photos": [
      {
        "src": "/media/einstein/EIN-M-0032.webp",
        "label": "Photograph"
      }
    ]
  },
  "EIN-M-0042": {
    "id": "EIN-M-0042",
    "slug": "einstein",
    "kind": "photo",
    "title": "Albert Einstein in study, standing",
    "theme": "Immigration & Migration",
    "holder": "Shelby White and Leon Levy Archives Center, Institute for Advanced Study",
    "catalogueId": "E 12",
    "rights": "CC BY 4.0",
    "source": "https://albert.ias.edu/entities/archivalmaterial/e8cdc700-f62d-4bb7-962d-fdbc8f2b598e",
    "credit": "Alan Richards, photographer. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA (E 12). CC BY 4.0.",
    "alt": "Albert Einstein standing in his home study at 112 Mercer Street, Princeton, New Jersey.",
    "lines": [
      {
        "label": "The study",
        "text": "Albert Einstein had a home study at 112 Mercer Street, Princeton, New Jersey.",
        "factId": "EIN-F-0087"
      }
    ],
    "maker": "Alan Richards, photographer",
    "photos": [
      {
        "src": "/media/einstein/EIN-M-0042.webp",
        "label": "Photograph"
      }
    ]
  },
  "EIN-PIPE-RECREATION": {
    "id": "EIN-PIPE-RECREATION",
    "slug": "einstein",
    "kind": "model",
    "title": "Einstein's Brier Pipe",
    "recreation": "Recreation from reference photographs; not the original object",
    "theme": "Science",
    "holder": "Original: National Museum of American History, Smithsonian Institution",
    "catalogueId": "1996.0006.01",
    "rights": "IHH recreation; the museum's photographs were used as modelling reference only",
    "source": "https://americanhistory.si.edu/collections/object/nmah_334905",
    "credit": "3D recreation by the Immigrant Hall of Honor, modelled from the museum's reference photographs (not shown).",
    "alt": "A 3D recreation of a straight briar pipe with a round bowl and a tapered stem.",
    "lines": [],
    "model": {
      "src": "/artifacts/einstein/pipe.glb",
      "notes": []
    }
  },
  // round 9 (owner directive 2026-10-29): Einstein, Albert (1879-1955), Winteler-Einstein, Maja (1881-1951)
  "EIN-M-0085": {
    id: "EIN-M-0085",
    slug: "einstein",
    kind: "photo",
    title: "Einstein, Albert (1879-1955), Winteler-Einstein, Maja (1881-1951)",
    date: "1885",
    year: 1885,
    theme: "Family",
    holder: "ETH Library Zurich, Image Archive",
    catalogueId: "Portr_03143-A",
    rights: "Public domain (holder: “Public Domain Mark”)",
    source: "https://doi.org/10.3932/ethz-a-000045771",
    credit: "ETH Library Zurich, Image Archive / Portr_03143-A",
    alt: "Einstein siblings as children, 1885: Einstein, Albert (1879-1955), Winteler-Einstein, Maja (1881-1951) (ETH Library Zurich, Image Archive / Portr_03143-A).",
    photos: [{ src: `${D}/EIN-M-0085.webp`, label: 'Photograph' }],
    lines: [],
  },
  // round 9 (owner directive 2026-10-29): Einstein (Connecticut Hebrew record (Hartford, Conn.), 1921-04-01, p. 19)
  "EIN-M-0086": {
    id: "EIN-M-0086",
    slug: "einstein",
    kind: "sheet",
    title: "Einstein (Connecticut Hebrew record (Hartford, Conn.), 1921-04-01, p. 19)",
    maker: "Connecticut Hebrew record (Hartford, Conn.)",
    date: "April 1, 1921",
    year: 1921,
    theme: "Family",
    holder: "Library of Congress, Chronicling America",
    catalogueId: "sn92051392, 1921-04-01, page sequence 19",
    rights: "Public domain (holder: “Newspapers published in the United States more than 95 years ago are in the public domain in their entirety.”)",
    source: "https://www.loc.gov/resource/sn92051392/1921-04-01/ed-1/?sp=19",
    credit: "Library of Congress, Chronicling America; Connecticut Hebrew record (Hartford, Conn.), 1921-04-01",
    alt: "Newspaper page, Connecticut Hebrew record, April 1, 1921, p. 19: an article on Albert Einstein stating that he was born at Ulm in March, 1879.",
    pages: [{ src: `${D}/EIN-M-0086.webp`, sizeM: page(1002, 2400), label: 'Page' }],
    lines: [{ label: "Born", text: "Albert Einstein was born 14 March 1879 in Ulm, Germany.", factId: "EIN-F-0005" }],
  },
  // round 9 (owner directive 2026-10-29): Will Renounce Citizenship (Evening star (Washington, D.C.), 1933-03-30, p. 3)
  "EIN-M-0087": {
    id: "EIN-M-0087",
    slug: "einstein",
    kind: "sheet",
    title: "Will Renounce Citizenship (Evening star (Washington, D.C.), 1933-03-30, p. 3)",
    maker: "Evening star (Washington, D.C.)",
    date: "March 30, 1933",
    year: 1933,
    theme: "Citizenship",
    holder: "Library of Congress, Chronicling America",
    catalogueId: "sn83045462, 1933-03-30, page sequence 3",
    rights: "Public domain (owner ruling 2026-10-27; holder: “The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions.”)",
    source: "https://www.loc.gov/resource/sn83045462/1933-03-30/ed-1/?sp=3",
    credit: "Library of Congress, Chronicling America; Evening star (Washington, D.C.), 1933-03-30",
    alt: "Newspaper item, Evening star, March 30, 1933, p. A-3: Prof. Albert Einstein, now in Belgium, has taken steps to renounce his citizenship.",
    pages: [{ src: `${D}/EIN-M-0087.webp`, sizeM: page(1900, 2200), label: 'Page' }],
    lines: [{ label: "Citizen", text: "In 1933 Albert Einstein renounced his German citizenship.", factId: "EIN-F-0109" }],
  },
  // round 9 (owner directive 2026-10-29): Einstein Is Hurried Through New York Without Reception (Evening star (Washington
  "EIN-M-0089": {
    id: "EIN-M-0089",
    slug: "einstein",
    kind: "sheet",
    title: "Einstein Is Hurried Through New York Without Reception (Evening star (Washington, D.C.), 1933-10-17, p. 2)",
    maker: "Evening star (Washington, D.C.)",
    date: "October 17, 1933",
    year: 1933,
    theme: "Immigration",
    holder: "Library of Congress, Chronicling America",
    catalogueId: "sn83045462, 1933-10-17, page sequence 2",
    rights: "Public domain (owner ruling 2026-10-27; holder: “The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions.”)",
    source: "https://www.loc.gov/resource/sn83045462/1933-10-17/ed-1/?sp=2",
    credit: "Library of Congress, Chronicling America; Evening star (Washington, D.C.), 1933-10-17",
    alt: "Newspaper item, Evening star, October 17, 1933, p. A-2: Einstein is hurried through New York without reception (EIN-F-0122, EIN-F-0125).",
    pages: [{ src: `${D}/EIN-M-0089.webp`, sizeM: page(1900, 2400), label: 'Page' }],
    lines: [{ label: "Arrived", text: "On October 17, 1933, Einstein arrived in New York on the Red Star liner Westernland.", factId: "EIN-F-0122" }, { label: "Arrived", text: "Einstein arrived accompanied by Mrs. Einstein and Dr Walther Mayer, of Vienna, his assistant.", factId: "EIN-F-0125" }],
  },
  // round 9 (owner directive 2026-10-29): Dr. Einstein Slips Into New York (The Washington times (Washington [D.C.]), 1933
  "EIN-M-0090": {
    id: "EIN-M-0090",
    slug: "einstein",
    kind: "sheet",
    title: "Dr. Einstein Slips Into New York (The Washington times (Washington [D.C.]), 1933-10-17, p. 1)",
    maker: "The Washington times (Washington [D.C.])",
    date: "October 17, 1933",
    year: 1933,
    theme: "Immigration",
    holder: "Library of Congress, Chronicling America",
    catalogueId: "sn84026749, 1933-10-17, page sequence 1",
    rights: "Public domain (owner ruling 2026-10-27; holder: “The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions.”)",
    source: "https://www.loc.gov/resource/sn84026749/1933-10-17/ed-1/?sp=1",
    credit: "Library of Congress, Chronicling America; The Washington times (Washington [D.C.]), 1933-10-17",
    alt: "The Washington times, October 17, 1933, p. 1: Dr. Einstein slips into New York (EIN-F-0123, EIN-F-0124).",
    pages: [{ src: `${D}/EIN-M-0090.webp`, sizeM: page(1900, 2400), label: 'Page' }],
    lines: [{ label: "Arrived", text: "On October 17, 1933, Prof. Albert Einstein was taken off the liner Westernland at Quarantine and sped ashore by tug.", factId: "EIN-F-0123" }, { label: "Arrived", text: "On October 17, 1933, the Einstein party landed at the Battery in New York.", factId: "EIN-F-0124" }],
  },
  // round 9 (owner directive 2026-10-29): Einstein, Serious Of Face, Becomes American Citizen (Imperial Valley press (El C
  "EIN-M-0091": {
    id: "EIN-M-0091",
    slug: "einstein",
    kind: "sheet",
    title: "Einstein, Serious Of Face, Becomes American Citizen (Imperial Valley press (El Centro, Calif.), 1940-10-01, p. 1)",
    maker: "Imperial Valley press (El Centro, Calif.)",
    date: "October 1, 1940",
    year: 1940,
    theme: "Citizenship",
    holder: "Library of Congress, Chronicling America",
    catalogueId: "sn92070146, 1940-10-01, page sequence 1",
    rights: "Public domain (owner ruling 2026-10-29; holder: “The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions.”)",
    source: "https://www.loc.gov/resource/sn92070146/1940-10-01/ed-1/?sp=1",
    credit: "Library of Congress, Chronicling America; Imperial Valley press (El Centro, Calif.), 1940-10-01",
    alt: "Front-page item, Imperial Valley press, October 1, 1940: Einstein becomes an American citizen at Trenton, in the presence of Judge Phillip Forman.",
    pages: [{ src: `${D}/EIN-M-0091.webp`, sizeM: page(1900, 1900), label: 'Page' }],
    lines: [{ label: "Citizen", text: "On 1940 Oct. 1, Albert Einstein was photographed receiving from Judge Phillip Forman his certificate of American citizenship.", factId: "EIN-F-0051" }],
  },
  // round 9 (owner directive 2026-10-29): Einstein Dies At Princeton (Evening star (Washington, D.C.), 1955-04-18, p. 1)
  "EIN-M-0092": {
    id: "EIN-M-0092",
    slug: "einstein",
    kind: "sheet",
    title: "Einstein Dies At Princeton (Evening star (Washington, D.C.), 1955-04-18, p. 1)",
    maker: "Evening star (Washington, D.C.)",
    date: "April 18, 1955",
    year: 1955,
    theme: "Legacy",
    holder: "Library of Congress, Chronicling America",
    catalogueId: "sn83045462, 1955-04-18, page sequence 1",
    rights: "Public domain (owner ruling 2026-10-29; holder: “The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions.”)",
    source: "https://www.loc.gov/resource/sn83045462/1955-04-18/ed-1/?sp=1",
    credit: "Library of Congress, Chronicling America; Evening star (Washington, D.C.), 1955-04-18",
    alt: "Evening star, April 18, 1955: Einstein Dies At Princeton (EIN-F-0006).",
    pages: [{ src: `${D}/EIN-M-0092.webp`, sizeM: page(1746, 2400), label: 'Page' }],
    lines: [{ label: "Died", text: "Albert Einstein died on April 18, 1955 at Princeton, New Jersey.", factId: "EIN-F-0006" }],
  },
  // round 9 journeys (owner decision 2026-10-29): a place photograph on the arrival map, [The pier, Southampton, England]
  "EIN-M-0084": {
    id: "EIN-M-0084",
    slug: "einstein",
    kind: "photo",
    title: "[The pier, Southampton, England]",
    date: "between ca. 1890 and ca. 1900",
    year: 1890,
    theme: "Immigration",
    holder: "Library of Congress Prints and Photographs Division",
    catalogueId: "2002708110",
    rights: "Public domain (holder: “No known restrictions on publication.”)",
    source: "https://www.loc.gov/item/2002708110/",
    credit: "Photochrom Print Collection, Library of Congress Prints and Photographs Division",
    alt: "[The pier, Southampton, England], photochrom print, between ca. 1890 and ca. 1900.",
    photos: [{ src: `${D}/EIN-M-0084.webp`, label: 'Photograph' }],
    lines: [],
  },
}
