// Lista original preservada para falhas de rede e uso offline.
export const CATEGORIAS = [
  {
    "categoria": "Cabelos",
    "titulo": "Cabelos",
    "descricao": "Cuidados capilares, cortes e coloração.",
    "imagem": "imagens/cabelos-capa.jpg",
    "alt": "Cabelo visto de costas, com mechas douradas e pontas modeladas",
    "classe": "cabelo",
    "visiveis": 4
  },
  {
    "categoria": "Tranças",
    "titulo": "Tranças",
    "descricao": "Modelos para valorizar seu estilo e sua beleza.",
    "imagem": "imagens/trancas-capa.webp",
    "alt": "Tranças rentes ao couro cabeludo com comprimento longo, vistas de costas",
    "classe": "trancas",
    "visiveis": 3
  },
  {
    "categoria": "Barbearia",
    "titulo": "Barbearia",
    "descricao": "Cortes, barba e cuidados masculinos.",
    "imagem": "imagens/barbearia-capa.jpeg",
    "alt": "Corte infantil com laterais em degradê e topo penteado de lado",
    "classe": "barbearia",
    "visiveis": 3
  },
  {
    "categoria": "Unhas",
    "titulo": "Nail Design",
    "descricao": "Pés, mãos, alongamento e nail art.",
    "imagem": "imagens/nail-design-capa.jpeg",
    "alt": "Unhas decoradas em rosa e nude, com brilho e detalhes dourados em formato de estrelas",
    "classe": "unhas",
    "visiveis": 3
  },
  {
    "categoria": "Estética",
    "titulo": "Estética e Beleza",
    "descricao": "Cuidados para realçar seus detalhes.",
    "imagem": "imagens/estetica-sobrancelhas-atual.webp",
    "alt": "Detalhe de sobrancelhas definidas e cílios",
    "classe": "estetica",
    "visiveis": 3
  }
];
export const SERVICOS_FALLBACK = [
  {
    "id": "35bbcef3-f4d1-1a2f-1bcf-ccedb29024be",
    "nome": "Escova",
    "categoria": "Cabelos",
    "preco": 50.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 0
  },
  {
    "id": "5a4ae89d-f390-32d7-aca8-ab4e64e2dcfa",
    "nome": "Escova e prancha",
    "categoria": "Cabelos",
    "preco": 65.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 1
  },
  {
    "id": "9f672916-7fc5-7af4-84d6-b8f2e9d8d871",
    "nome": "Hidratação",
    "categoria": "Cabelos",
    "preco": 75.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 2
  },
  {
    "id": "b619330e-f887-0ff6-6a9f-acb0cd510a71",
    "nome": "Nutrição",
    "categoria": "Cabelos",
    "preco": 85.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 3
  },
  {
    "id": "550a3ae6-da34-2a3b-42d5-6e8d9da80277",
    "nome": "Reconstrução",
    "categoria": "Cabelos",
    "preco": 90.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 4
  },
  {
    "id": "232a20a3-b2a9-2c09-eb6d-e04e61bf068b",
    "nome": "Cauterização",
    "categoria": "Cabelos",
    "preco": 100.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 5
  },
  {
    "id": "782b738a-89f1-4f29-041e-dc8b7a292576",
    "nome": "Botox",
    "categoria": "Cabelos",
    "preco": 120.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 6
  },
  {
    "id": "9736de7b-aa23-96a5-40d4-dc89fa8f9877",
    "nome": "Escova inteligente",
    "categoria": "Cabelos",
    "preco": 200.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 7
  },
  {
    "id": "471a66df-9769-1f0d-f7ca-907df13e8153",
    "nome": "Escova orgânica",
    "categoria": "Cabelos",
    "preco": 250.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 8
  },
  {
    "id": "b8657f68-ff47-73ca-c5f5-b9105a7e9ace",
    "nome": "Fitagem simples",
    "categoria": "Cabelos",
    "preco": 75.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 9
  },
  {
    "id": "f1d82ff1-a463-2c60-90a7-1247866ea043",
    "nome": "Fitagem Premium",
    "categoria": "Cabelos",
    "preco": 95.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 10
  },
  {
    "id": "7d064312-da01-fb65-4711-0ba0e1b71e67",
    "nome": "Design de corte feminino",
    "categoria": "Cabelos",
    "preco": 100.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 11
  },
  {
    "id": "9ef27427-8830-5792-970b-b32c097d57ef",
    "nome": "Algoterapia",
    "categoria": "Cabelos",
    "preco": 130.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 12
  },
  {
    "id": "41272c08-656d-73c4-f6c6-dc0a2669731c",
    "nome": "Aplicação de coloração",
    "categoria": "Cabelos",
    "preco": 60.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 13
  },
  {
    "id": "cb2a3e91-e98a-2423-f720-5e9400b838b8",
    "nome": "Coloração",
    "categoria": "Cabelos",
    "preco": 120.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 14
  },
  {
    "id": "c580f296-b1a8-8414-6bec-fcf8bc34c20d",
    "nome": "Mechas",
    "categoria": "Cabelos",
    "preco": null,
    "tipo_preco": "avaliacao",
    "observacao": "",
    "disponivel": true,
    "ordem": 15
  },
  {
    "id": "b4724ede-97f5-3168-a961-38956f2a2b90",
    "nome": "Trança lateral",
    "categoria": "Tranças",
    "preco": 55.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 0
  },
  {
    "id": "8b678605-c1fa-2c35-9709-7376e90cefd0",
    "nome": "Trança topo",
    "categoria": "Tranças",
    "preco": 60.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 1
  },
  {
    "id": "a5e87753-1edc-e7b1-4b3b-0e650064f34c",
    "nome": "Trança tiara",
    "categoria": "Tranças",
    "preco": 75.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 2
  },
  {
    "id": "af2fc065-83f0-5354-e588-fb788508532f",
    "nome": "Trança princesa",
    "categoria": "Tranças",
    "preco": 90.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 3
  },
  {
    "id": "be82c60d-173c-9fb0-13b3-19d034fb87c0",
    "nome": "Trança boxeadora",
    "categoria": "Tranças",
    "preco": 110.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 4
  },
  {
    "id": "903ef374-96bc-6001-50b5-c6cec79ba24e",
    "nome": "Trança Nagê ou Ghanna",
    "categoria": "Tranças",
    "preco": 150.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 5
  },
  {
    "id": "047b9db4-95e7-9647-87d8-ddd010b931cd",
    "nome": "Tranças soltas",
    "categoria": "Tranças",
    "preco": 400.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 6
  },
  {
    "id": "55162a60-d354-9a33-47b2-8d6e2ffacdd9",
    "nome": "Corte social",
    "categoria": "Barbearia",
    "preco": 35.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 0
  },
  {
    "id": "4130f821-7a4a-afcd-f2a5-d3a9933a91dd",
    "nome": "Corte degradê",
    "categoria": "Barbearia",
    "preco": 40.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 1
  },
  {
    "id": "9403b207-f360-8a81-2665-3b3a6049cde2",
    "nome": "Corte infantil (crianças até 8 anos)",
    "categoria": "Barbearia",
    "preco": 50.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 2
  },
  {
    "id": "c805a30d-cca7-7c21-06df-425fb0ab7ab2",
    "nome": "Barba simples",
    "categoria": "Barbearia",
    "preco": 30.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 3
  },
  {
    "id": "fa5740e1-8e0d-8f7c-5b2f-3fcf8f789a52",
    "nome": "Barba com toalha quente",
    "categoria": "Barbearia",
    "preco": 40.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 4
  },
  {
    "id": "0f54ad13-2f35-3ee4-1eee-35a5a0341673",
    "nome": "Sobrancelha na navalha",
    "categoria": "Barbearia",
    "preco": 20.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 5
  },
  {
    "id": "64e8d896-3e92-8166-96e0-c25984595e4e",
    "nome": "Depilação de nariz",
    "categoria": "Barbearia",
    "preco": 15.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 6
  },
  {
    "id": "59dfd9ba-7c16-1d67-e8da-eb2f9de11ce8",
    "nome": "Depilação de orelha",
    "categoria": "Barbearia",
    "preco": 15.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 7
  },
  {
    "id": "ccb7f347-8f8d-263f-f37f-e1d45a721948",
    "nome": "Botox capilar masculino",
    "categoria": "Barbearia",
    "preco": 70.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 8
  },
  {
    "id": "368907bb-80be-1758-3cc9-2d81ca4d858b",
    "nome": "Inteligente masculina",
    "categoria": "Barbearia",
    "preco": 90.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 9
  },
  {
    "id": "e85f173e-3818-2ac1-65c0-12d34a3d9271",
    "nome": "Luzes masculinas",
    "categoria": "Barbearia",
    "preco": 90.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 10
  },
  {
    "id": "dfd22eff-b92a-2090-2a75-b872cd1bc276",
    "nome": "Tranças masculinas",
    "categoria": "Barbearia",
    "preco": 130.0,
    "tipo_preco": "a_partir",
    "observacao": "",
    "disponivel": true,
    "ordem": 11
  },
  {
    "id": "79242cec-a24d-883b-dd20-82686e25c461",
    "nome": "Pés e mãos",
    "categoria": "Unhas",
    "preco": 55.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 0
  },
  {
    "id": "c9acc0ea-be32-ad45-88bb-f72b1f5e5561",
    "nome": "Pés",
    "categoria": "Unhas",
    "preco": 30.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 1
  },
  {
    "id": "81921b4b-67a8-940b-aff5-6e2a5b85379c",
    "nome": "Mãos",
    "categoria": "Unhas",
    "preco": 30.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 2
  },
  {
    "id": "81e5257e-8bf3-e322-b490-423192b70ce1",
    "nome": "Spa dos pés",
    "categoria": "Unhas",
    "preco": 60.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 3
  },
  {
    "id": "17337590-1866-e5ee-073c-bfe1ba12e910",
    "nome": "Plástica dos pés",
    "categoria": "Unhas",
    "preco": 80.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 4
  },
  {
    "id": "2adc5ac4-a193-5253-f111-dbc38ba690e8",
    "nome": "Plástica + spa",
    "categoria": "Unhas",
    "preco": 95.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 5
  },
  {
    "id": "17b5340d-fdca-5392-a560-7306bbcbbc62",
    "nome": "Pés + francesinha",
    "categoria": "Unhas",
    "preco": 35.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 6
  },
  {
    "id": "77185356-2aef-9aee-4cc0-18b5fc9a7c37",
    "nome": "Alongamento acrílico",
    "categoria": "Unhas",
    "preco": 130.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 7
  },
  {
    "id": "5a383ff7-6d03-c46f-fb8f-79c0817f11fd",
    "nome": "Manutenção",
    "categoria": "Unhas",
    "preco": 100.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 8
  },
  {
    "id": "80de6211-8094-fb72-ec89-694986642e02",
    "nome": "Banho acrílico",
    "categoria": "Unhas",
    "preco": 105.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 9
  },
  {
    "id": "a950a176-afe6-5329-1320-8e3150a4f20b",
    "nome": "Esmaltação em gel",
    "categoria": "Unhas",
    "preco": 60.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 10
  },
  {
    "id": "c3963388-a5a6-217a-e7b7-805d890a59e5",
    "nome": "Esmaltação em gel nos pés",
    "categoria": "Unhas",
    "preco": 60.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 11
  },
  {
    "id": "2008e985-ffc4-375d-64d8-63fb10b3cfb5",
    "nome": "Postiças realistas",
    "categoria": "Unhas",
    "preco": 80.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 12
  },
  {
    "id": "7414fed7-bfc2-4502-ae1e-3900e0c89ec0",
    "nome": "Nail art simples",
    "categoria": "Unhas",
    "preco": 15.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 13
  },
  {
    "id": "17218886-d54a-a59b-0fea-e45d32b7d19e",
    "nome": "Nail art intermediária",
    "categoria": "Unhas",
    "preco": 20.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 14
  },
  {
    "id": "6422e9aa-ff44-f5a9-1705-b1416c5e1fc6",
    "nome": "Nail art avançada",
    "categoria": "Unhas",
    "preco": 30.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 15
  },
  {
    "id": "fb5c1512-4a2d-0609-6043-5073d55ca278",
    "nome": "Design de sobrancelhas",
    "categoria": "Estética",
    "preco": 30.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 0
  },
  {
    "id": "ee0ba308-483a-7773-89d7-cc45410ac332",
    "nome": "Design com henna",
    "categoria": "Estética",
    "preco": 45.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 1
  },
  {
    "id": "b52f135d-de82-44ca-48bc-144c69fc59ab",
    "nome": "Buço",
    "categoria": "Estética",
    "preco": 15.0,
    "tipo_preco": "fixo",
    "observacao": "",
    "disponivel": true,
    "ordem": 2
  }
];
