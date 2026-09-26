// 100% Indian Music Pools for Sonique (Bollywood, Punjabi, Indian Indie, Sufi, South Indian)

export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const indianQuickPicksPool = [
  { id: "BddP6PYo2Gs", title: "Kesariya", artist: "Arijit Singh, Pritam", duration: 282, coverUrl: "https://i.ytimg.com/vi/BddP6PYo2Gs/hqdefault.jpg" },
  { id: "ElZfdU54Cp8", title: "Apna Bana Le", artist: "Arijit Singh, Sachin-Jigar", duration: 264, coverUrl: "https://i.ytimg.com/vi/ElZfdU54Cp8/hqdefault.jpg" },
  { id: "RLzC55ai0eo", title: "Heeriye", artist: "Jasleen Royal, Arijit Singh", duration: 194, coverUrl: "https://i.ytimg.com/vi/RLzC55ai0eo/hqdefault.jpg" },
  { id: "VAdGW7QDJiU", title: "Kahani Suno 2.0", artist: "Kaifi Khalil", duration: 173, coverUrl: "https://i.ytimg.com/vi/VAdGW7QDJiU/hqdefault.jpg" },
  { id: "4NDcT46M_aE", title: "Cheques", artist: "Shubh", duration: 183, coverUrl: "https://i.ytimg.com/vi/4NDcT46M_aE/hqdefault.jpg" },
  { id: "V1DbxhEMMcU", title: "Chaleya", artist: "Anirudh Ravichander, Arijit Singh", duration: 200, coverUrl: "https://i.ytimg.com/vi/V1DbxhEMMcU/hqdefault.jpg" },
  { id: "L0yX-Qe7Vkk", title: "Maan Meri Jaan", artist: "King", duration: 194, coverUrl: "https://i.ytimg.com/vi/L0yX-Qe7Vkk/hqdefault.jpg" },
  { id: "SAcpESN_Fk4", title: "Dil Diyan Gallan", artist: "Atif Aslam, Vishal-Shekhar", duration: 260, coverUrl: "https://i.ytimg.com/vi/SAcpESN_Fk4/hqdefault.jpg" },
  { id: "Umqb9pEs8B4", title: "Pasoori", artist: "Ali Sethi, Shae Gill", duration: 224, coverUrl: "https://i.ytimg.com/vi/Umqb9pEs8B4/hqdefault.jpg" },
  { id: "H5v3kku4y6Q", title: "Raataan Lambiyan", artist: "Jubin Nautiyal, Asees Kaur", duration: 230, coverUrl: "https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg" },
  { id: "d6q17W4hTio", title: "Husn", artist: "Anuv Jain", duration: 218, coverUrl: "https://i.ytimg.com/vi/d6q17W4hTio/hqdefault.jpg" },
  { id: "vX2cDW8LUWk", title: "Softly", artist: "Karan Aujla, Ikky", duration: 160, coverUrl: "https://i.ytimg.com/vi/vX2cDW8LUWk/hqdefault.jpg" },
  { id: "cl0a3iBN78U", title: "Elevated", artist: "Shubh", duration: 200, coverUrl: "https://i.ytimg.com/vi/cl0a3iBN78U/hqdefault.jpg" },
  { id: "BBAyRBTfsOU", title: "Ghalat Fehmi", artist: "Asim Azhar", duration: 215, coverUrl: "https://i.ytimg.com/vi/BBAyRBTfsOU/hqdefault.jpg" },
  { id: "kJW7-DYjWc0", title: "Shayad", artist: "Arijit Singh, Pritam", duration: 247, coverUrl: "https://i.ytimg.com/vi/kJW7-DYjWc0/hqdefault.jpg" },
  { id: "TaubaTauba01", title: "Tauba Tauba", artist: "Karan Aujla", duration: 205, coverUrl: "https://i.ytimg.com/vi/BddP6PYo2Gs/hqdefault.jpg" },
  { id: "OMahiDunki01", title: "O Mahi O Mahi", artist: "Arijit Singh", duration: 230, coverUrl: "https://i.ytimg.com/vi/ElZfdU54Cp8/hqdefault.jpg" },
  { id: "SatrangaAnim", title: "Satranga", artist: "Arijit Singh, Shreyas Puranik", duration: 270, coverUrl: "https://i.ytimg.com/vi/RLzC55ai0eo/hqdefault.jpg" },
  { id: "NainaCrew01", title: "Naina", artist: "Diljit Dosanjh, Badshah", duration: 180, coverUrl: "https://i.ytimg.com/vi/4NDcT46M_aE/hqdefault.jpg" },
  { id: "VeKamleyaRrk", title: "Ve Kamleya", artist: "Arijit Singh, Shreya Ghoshal", duration: 245, coverUrl: "https://i.ytimg.com/vi/V1DbxhEMMcU/hqdefault.jpg" },
  { id: "PhirAurKyaCh", title: "Phir Aur Kya Chahiye", artist: "Arijit Singh, Sachin-Jigar", duration: 266, coverUrl: "https://i.ytimg.com/vi/L0yX-Qe7Vkk/hqdefault.jpg" },
  { id: "TereHawaaleL", title: "Tere Hawaale", artist: "Arijit Singh, Shilpa Rao", duration: 340, coverUrl: "https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg" },
  { id: "ChooLoLocalT", title: "Choo Lo", artist: "The Local Train", duration: 234, coverUrl: "https://i.ytimg.com/vi/d6q17W4hTio/hqdefault.jpg" },
  { id: "BaarisheinAn", title: "Baarishein", artist: "Anuv Jain", duration: 205, coverUrl: "https://i.ytimg.com/vi/vX2cDW8LUWk/hqdefault.jpg" },
  { id: "AkhiyaanGula", title: "Akhiyaan Gulaab", artist: "Mitraz", duration: 190, coverUrl: "https://i.ytimg.com/vi/cl0a3iBN78U/hqdefault.jpg" },
  { id: "SoulmateBads", title: "Soulmate", artist: "Badshah, Arijit Singh", duration: 210, coverUrl: "https://i.ytimg.com/vi/BBAyRBTfsOU/hqdefault.jpg" },
  { id: "ZalimaRaees0", title: "Zalima", artist: "Arijit Singh, Harshdeep Kaur", duration: 290, coverUrl: "https://i.ytimg.com/vi/kJW7-DYjWc0/hqdefault.jpg" },
  { id: "SubhanallahJ", title: "Subhanallah", artist: "Sreerama Chandra, Shilpa Rao", duration: 249, coverUrl: "https://i.ytimg.com/vi/BddP6PYo2Gs/hqdefault.jpg" },
  { id: "AgarTumSaath", title: "Agar Tum Saath Ho", artist: "Arijit Singh, Alka Yagnik", duration: 341, coverUrl: "https://i.ytimg.com/vi/ElZfdU54Cp8/hqdefault.jpg" },
  { id: "TumSeHiJabWe", title: "Tum Se Hi", artist: "Mohit Chauhan, Pritam", duration: 320, coverUrl: "https://i.ytimg.com/vi/RLzC55ai0eo/hqdefault.jpg" }
];

export const indianThrowback90sPool = [
  { id: "o1-fD6k7o5k", title: "Tujhe Dekha Toh Yeh Jaana Sanam", artist: "Kumar Sanu, Lata Mangeshkar", duration: 300, coverUrl: "https://i.ytimg.com/vi/o1-fD6k7o5k/hqdefault.jpg" },
  { id: "0w4Z4P0h-3Y", title: "Pehla Nasha", artist: "Udit Narayan, Sadhana Sargam", duration: 280, coverUrl: "https://i.ytimg.com/vi/0w4Z4P0h-3Y/hqdefault.jpg" },
  { id: "Lq2UrnxaVw4", title: "Chaiyya Chaiyya", artist: "Sukhwinder Singh, Sapna Awasthi", duration: 410, coverUrl: "https://i.ytimg.com/vi/Lq2UrnxaVw4/hqdefault.jpg" },
  { id: "cMVm7U-K5o4", title: "Kuch Kuch Hota Hai", artist: "Udit Narayan, Alka Yagnik", duration: 290, coverUrl: "https://i.ytimg.com/vi/cMVm7U-K5o4/hqdefault.jpg" },
  { id: "Y5d7N63-z3k", title: "Dil To Pagal Hai", artist: "Lata Mangeshkar, Udit Narayan", duration: 320, coverUrl: "https://i.ytimg.com/vi/Y5d7N63-z3k/hqdefault.jpg" },
  { id: "kS4fP4l5M4w", title: "Raja Ko Rani Se", artist: "Udit Narayan, Alka Yagnik", duration: 310, coverUrl: "https://i.ytimg.com/vi/kS4fP4l5M4w/hqdefault.jpg" },
  { id: "M5u9N3q9P7k", title: "Bahut Pyar Karte Hai", artist: "SP Balasubrahmanyam", duration: 270, coverUrl: "https://i.ytimg.com/vi/M5u9N3q9P7k/hqdefault.jpg" },
  { id: "v8L4m0W5N7Q", title: "Aankhey Khuli", artist: "Lata Mangeshkar, Udit Narayan", duration: 420, coverUrl: "https://i.ytimg.com/vi/v8L4m0W5N7Q/hqdefault.jpg" },
  { id: "N6P5M8K9L7Q", title: "Dheere Dheere Se Meri Zindagi", artist: "Kumar Sanu, Anuradha Paudwal", duration: 330, coverUrl: "https://i.ytimg.com/vi/N6P5M8K9L7Q/hqdefault.jpg" },
  { id: "P4L7m9W2K5Q", title: "Tip Tip Barsa Paani", artist: "Udit Narayan, Alka Yagnik", duration: 340, coverUrl: "https://i.ytimg.com/vi/P4L7m9W2K5Q/hqdefault.jpg" },
  { id: "K9M5P8L7N2Q", title: "Chura Ke Dil Mera", artist: "Kumar Sanu, Alka Yagnik", duration: 310, coverUrl: "https://i.ytimg.com/vi/K9M5P8L7N2Q/hqdefault.jpg" },
  { id: "L5M9P7K2N4Q", title: "Ek Ladki Ko Dekha", artist: "Kumar Sanu", duration: 275, coverUrl: "https://i.ytimg.com/vi/L5M9P7K2N4Q/hqdefault.jpg" },
  { id: "M9P7L5K2N8Q", title: "O O Jaane Jaana", artist: "Kamaal Khan", duration: 325, coverUrl: "https://i.ytimg.com/vi/M9P7L5K2N8Q/hqdefault.jpg" },
  { id: "P7L5M9K2N6Q", title: "Chhookar Mere Manko", artist: "Kishore Kumar", duration: 290, coverUrl: "https://i.ytimg.com/vi/P7L5M9K2N6Q/hqdefault.jpg" },
  { id: "N5M9P7L2K8Q", title: "Kehna Hi Kya", artist: "K.S. Chithra, A.R. Rahman", duration: 350, coverUrl: "https://i.ytimg.com/vi/N5M9P7L2K8Q/hqdefault.jpg" },
  { id: "Q7L5M9K2N4Q", title: "Tu Mile Dil Khile", artist: "Kumar Sanu, Chithra", duration: 370, coverUrl: "https://i.ytimg.com/vi/Q7L5M9K2N4Q/hqdefault.jpg" },
  { id: "R9M5P7L2K6Q", title: "Roja Janeman", artist: "Hariharan, A.R. Rahman", duration: 300, coverUrl: "https://i.ytimg.com/vi/R9M5P7L2K6Q/hqdefault.jpg" },
  { id: "S5M9P7L2K8Q", title: "Ye Kaali Kaali Aankhen", artist: "Kumar Sanu, Anu Malik", duration: 340, coverUrl: "https://i.ytimg.com/vi/S5M9P7L2K8Q/hqdefault.jpg" },
  { id: "T7L5M9K2N4Q", title: "Pardesi Pardesi", artist: "Udit Narayan, Alka Yagnik", duration: 430, coverUrl: "https://i.ytimg.com/vi/T7L5M9K2N4Q/hqdefault.jpg" },
  { id: "U9M5P7L2K6Q", title: "Aaye Ho Meri Zindagi Mein", artist: "Udit Narayan", duration: 360, coverUrl: "https://i.ytimg.com/vi/U9M5P7L2K6Q/hqdefault.jpg" },
  { id: "AankhonMeinT", title: "Aankhon Mein Teri", artist: "KK, Vishal-Shekhar", duration: 280, coverUrl: "https://i.ytimg.com/vi/o1-fD6k7o5k/hqdefault.jpg" },
  { id: "ZaraSaKKPrit", title: "Zara Sa", artist: "KK, Pritam", duration: 290, coverUrl: "https://i.ytimg.com/vi/0w4Z4P0h-3Y/hqdefault.jpg" },
  { id: "DilChahtaHai", title: "Dil Chahta Hai", artist: "Shankar Mahadevan", duration: 310, coverUrl: "https://i.ytimg.com/vi/Lq2UrnxaVw4/hqdefault.jpg" },
  { id: "KalHoNaaHoS", title: "Kal Ho Naa Ho", artist: "Sonu Nigam, Shankar-Ehsaan-Loy", duration: 320, coverUrl: "https://i.ytimg.com/vi/cMVm7U-K5o4/hqdefault.jpg" },
  { id: "SurajHuaMadd", title: "Suraj Hua Maddham", artist: "Sonu Nigam, Alka Yagnik", duration: 340, coverUrl: "https://i.ytimg.com/vi/Y5d7N63-z3k/hqdefault.jpg" }
];

export const indianMoreForYouPool = [
  { id: "JvN_Z2L0n9k", title: "Sun Saathiya", artist: "Divya Kumar, Priya Saraiya", duration: 220, coverUrl: "https://i.ytimg.com/vi/JvN_Z2L0n9k/hqdefault.jpg" },
  { id: "w_M4P8K9L7Q", title: "Kun Faya Kun", artist: "A.R. Rahman, Javed Ali", duration: 340, coverUrl: "https://i.ytimg.com/vi/w_M4P8K9L7Q/hqdefault.jpg" },
  { id: "x_P5M8K9L7Q", title: "Khairiyat", artist: "Arijit Singh, Pritam", duration: 280, coverUrl: "https://i.ytimg.com/vi/x_P5M8K9L7Q/hqdefault.jpg" },
  { id: "y_L7m9W2K5Q", title: "Ghar More Pardesiya", artist: "Shreya Ghoshal, Vaishali Mhade", duration: 310, coverUrl: "https://i.ytimg.com/vi/y_L7m9W2K5Q/hqdefault.jpg" },
  { id: "z_K9M5P8L7N", title: "Namo Namo", artist: "Amit Trivedi", duration: 320, coverUrl: "https://i.ytimg.com/vi/z_K9M5P8L7N/hqdefault.jpg" },
  { id: "a_L5M9P7K2N", title: "Ik Vaari Aa", artist: "Arijit Singh, Pritam", duration: 275, coverUrl: "https://i.ytimg.com/vi/a_L5M9P7K2N/hqdefault.jpg" },
  { id: "b_M9P7L5K2N", title: "Tera Ban Jaunga", artist: "Akhil Sachdeva, Tulsi Kumar", duration: 235, coverUrl: "https://i.ytimg.com/vi/b_M9P7L5K2N/hqdefault.jpg" },
  { id: "c_P7L5M9K2N", title: "Bekhayali", artist: "Sachet Tandon", duration: 370, coverUrl: "https://i.ytimg.com/vi/c_P7L5M9K2N/hqdefault.jpg" },
  { id: "d_N5M9P7L2K", title: "Tujhe Kitna Chahne Lage", artist: "Arijit Singh", duration: 284, coverUrl: "https://i.ytimg.com/vi/d_N5M9P7L2K/hqdefault.jpg" },
  { id: "e_Q7L5M9K2N", title: "Ve Maahi", artist: "Arijit Singh, Asees Kaur", duration: 220, coverUrl: "https://i.ytimg.com/vi/e_Q7L5M9K2N/hqdefault.jpg" },
  { id: "f_R9M5P7L2K", title: "Pal Pal Dil Ke Paas", artist: "Arijit Singh, Parampara", duration: 254, coverUrl: "https://i.ytimg.com/vi/f_R9M5P7L2K/hqdefault.jpg" },
  { id: "i_U9M5P7L2K", title: "Soni Soni", artist: "Darshan Raval, Jonita Gandhi", duration: 195, coverUrl: "https://i.ytimg.com/vi/i_U9M5P7L2K/hqdefault.jpg" },
  { id: "l_X5M1P3L7K", title: "Saami Saami", artist: "Sunidhi Chauhan", duration: 220, coverUrl: "https://i.ytimg.com/vi/l_X5M1P3L7K/hqdefault.jpg" },
  { id: "m_Y7M3P5L9K", title: "Oo Antava", artist: "Indravathi Chauhan", duration: 215, coverUrl: "https://i.ytimg.com/vi/m_Y7M3P5L9K/hqdefault.jpg" },
  { id: "n_Z9M5P7L1K", title: "Srivalli", artist: "Javed Ali", duration: 220, coverUrl: "https://i.ytimg.com/vi/n_Z9M5P7L1K/hqdefault.jpg" },
  { id: "o_A1M3P5L7K", title: "Naatu Naatu", artist: "Rahul Sipligunj, Kaala Bhairava", duration: 215, coverUrl: "https://i.ytimg.com/vi/o_A1M3P5L7K/hqdefault.jpg" },
  { id: "KhaabonKeP", title: "Khaabon Ke Parindey", artist: "Mohit Chauhan, Alyssa Mendonsa", duration: 250, coverUrl: "https://i.ytimg.com/vi/JvN_Z2L0n9k/hqdefault.jpg" },
  { id: "MitwaKANK01", title: "Mitwa", artist: "Shankar Mahadevan, Caralisa Monteiro", duration: 320, coverUrl: "https://i.ytimg.com/vi/w_M4P8K9L7Q/hqdefault.jpg" },
  { id: "KabiraYJHD0", title: "Kabira", artist: "Tochi Raina, Rekha Bhardwaj", duration: 223, coverUrl: "https://i.ytimg.com/vi/x_P5M8K9L7Q/hqdefault.jpg" },
  { id: "BalamPichkari", title: "Balam Pichkari", artist: "Vishal Dadlani, Shalmali Kholgade", duration: 289, coverUrl: "https://i.ytimg.com/vi/y_L7m9W2K5Q/hqdefault.jpg" },
  { id: "GalliyanEkVi", title: "Galliyan", artist: "Ankit Tiwari", duration: 340, coverUrl: "https://i.ytimg.com/vi/z_K9M5P8L7N/hqdefault.jpg" },
  { id: "JeenaJeenaAt", title: "Jeena Jeena", artist: "Atif Aslam, Sachin-Jigar", duration: 229, coverUrl: "https://i.ytimg.com/vi/a_L5M9P7K2N/hqdefault.jpg" },
  { id: "MuskuraneKi", title: "Muskurane", artist: "Arijit Singh, Jeet Gannguli", duration: 334, coverUrl: "https://i.ytimg.com/vi/b_M9P7L5K2N/hqdefault.jpg" },
  { id: "HamariAdhuri", title: "Hamari Adhuri Kahani", artist: "Arijit Singh", duration: 380, coverUrl: "https://i.ytimg.com/vi/c_P7L5M9K2N/hqdefault.jpg" },
  { id: "SanamReArij", title: "Sanam Re", artist: "Arijit Singh, Mithoon", duration: 308, coverUrl: "https://i.ytimg.com/vi/d_N5M9P7L2K/hqdefault.jpg" }
];

export const popularAlbumsList = [
  { id: "MPREb_E4GfUXfDfhy", name: "Aashiqui 2", cover: "https://yt3.googleusercontent.com/3q33amH9hzn1dO8IeAX7TMb1QtEVfvVbqd2eSCaelOXNVmfMjbpDYdqD2HSiXtNP6i5Es7oynkWU2NfOXA=w544-h544-l90-rj" },
  { id: "MPREb_iM8jILFK2Qm", name: "Brahmastra", cover: "https://yt3.googleusercontent.com/eLoQKzskAIeNPego41FH2sz5uFy-A3Ynf1rcNdQ4eKv4J10atKk_RKbZDnQ3Ja-UNM8mKSu_-8gNeVYp4g=w544-h544-l90-rj" },
  { id: "MPREb_RcOqUyfS2Bi", name: "Kabir Singh", cover: "https://yt3.googleusercontent.com/loAKTa9XpvZzV-TORspRPC978Kk_u2l6tYlHTHm-sYfwjmKsJdShoxbmLoPKoq9eZgq-uzpoRPtqEWX09w=w544-h544-l90-rj" },
  { id: "MPREb_QFpeH3GzBe4", name: "Yeh Jawaani Hai Deewani", cover: "https://yt3.googleusercontent.com/8WRsPwoMoabdu5ISlf9f7tGGPzd2I7CTaWxc8qd6GYjaEBreC2Yw0KWMId6Y2vUTqSkt7GdlUi4NAXyf=w544-h544-l90-rj" },
  { id: "MPREb_apAhqhJObbd", name: "Bhediya", cover: "https://yt3.googleusercontent.com/5yKTPfOWf1AhqP0QY29N1uOL3lYq4hq9ZCJoWgugoB_WSf_MVHkr-C5FRuWJsakWjlaPzhiy1_fZHjxx=w544-h544-l90-rj" },
  { id: "MPREb_FNWEz3Y5YyZ", name: "Munjya", cover: "https://yt3.googleusercontent.com/7BiezafiDJcnp1s7UffTwd_VM9xVTZFzmb_yoiM4O2HEXecTA2OkW2CySTmqsyxeQsd36fv5P2FmBls=w544-h544-l90-rj" },
  { id: "MPREb_E9Diy6kXmlV", name: "Rockstar", cover: "https://yt3.googleusercontent.com/KYw74XSQwtKPbZTrHMNEBAnEMg1P1gNGwymnZwBSjstbqSE-MpigGlTIy6IZvC-ERlRkeP0c7VTiZObS=w544-h544-l90-rj" },
  { id: "MPREb_Wv34uDr4ODd", name: "Dilwale", cover: "https://yt3.googleusercontent.com/7FxbxKIussM0Pu0YJa9eXy2eN9-f8g82NFoKpeepDQavqn_Auja9TzR_9b1wgMrfHQrGDLOtQymO-PfZ=w544-h544-l90-rj" },
  { id: "MPREb_suGXcALkg8R", name: "Ae Dil Hai Mushkil", cover: "https://yt3.googleusercontent.com/0eoKSZD2aThVTG85MaO4j6r_pVMmDlvnlMWmhGEn9WBak9Ncu9uFRYh82uKZqqouebyaBcI4WLhvQrml=w544-h544-l90-rj" },
  { id: "MPREb_iE3Pd08juWf", name: "Shershaah", cover: "https://yt3.googleusercontent.com/iL_YgaRWLLzfwYP1mL9mTl0776jHYymJnsNcQlkzztzVEks8z__hMIKIvMfggcaqLah3pdQxR1NcWnPf=w544-h544-l90-rj" },
  { id: "MPREb_PrESMGET7eK", name: "Animal", cover: "https://yt3.googleusercontent.com/tM7On61s7pbU8DsHeusopX-HRQerc4Xyv2Pc5Nveb3F932QuadCwslZEP_yeU7iQk2XX9w-r63nZgZk=w544-h544-l90-rj" },
  { id: "MPREb_kOsn8M38LcA", name: "Laila Majnu", cover: "https://yt3.googleusercontent.com/0is50INmTrcfZEK3onQ67l6lxLM6ECEhjuPbepEsqnqOsRse3G6ortxZxBGtSI---0GI0nVIF4CoObYaSw=w544-h544-l90-rj" },
  { id: "MPREb_Z5W7v8Q1m", name: "Stree 2", cover: "https://yt3.googleusercontent.com/tM7On61s7pbU8DsHeusopX-HRQerc4Xyv2Pc5Nveb3F932QuadCwslZEP_yeU7iQk2XX9w-r63nZgZk=w544-h544-l90-rj" },
  { id: "MPREb_X8P9v2Q3m", name: "Jawan", cover: "https://yt3.googleusercontent.com/3q33amH9hzn1dO8IeAX7TMb1QtEVfvVbqd2eSCaelOXNVmfMjbpDYdqD2HSiXtNP6i5Es7oynkWU2NfOXA=w544-h544-l90-rj" },
  { id: "MPREb_Y4N7v5Q9m", name: "Pathaan", cover: "https://yt3.googleusercontent.com/eLoQKzskAIeNPego41FH2sz5uFy-A3Ynf1rcNdQ4eKv4J10atKk_RKbZDnQ3Ja-UNM8mKSu_-8gNeVYp4g=w544-h544-l90-rj" },
  { id: "MPREb_V2M9v7Q1m", name: "Tu Jhoothi Main Makkaar", cover: "https://yt3.googleusercontent.com/loAKTa9XpvZzV-TORspRPC978Kk_u2l6tYlHTHm-sYfwjmKsJdShoxbmLoPKoq9eZgq-uzpoRPtqEWX09w=w544-h544-l90-rj" },
  { id: "MPREb_W5P3v9Q7m", name: "Bhool Bhulaiyaa 2", cover: "https://yt3.googleusercontent.com/8WRsPwoMoabdu5ISlf9f7tGGPzd2I7CTaWxc8qd6GYjaEBreC2Yw0KWMId6Y2vUTqSkt7GdlUi4NAXyf=w544-h544-l90-rj" },
  { id: "MPREb_Z8N2v4Q6m", name: "Luka Chuppi", cover: "https://yt3.googleusercontent.com/5yKTPfOWf1AhqP0QY29N1uOL3lYq4hq9ZCJoWgugoB_WSf_MVHkr-C5FRuWJsakWjlaPzhiy1_fZHjxx=w544-h544-l90-rj" },
  { id: "MPREb_Y3P7v2Q5m", name: "Sonu Ke Titu Ki Sweety", cover: "https://yt3.googleusercontent.com/7BiezafiDJcnp1s7UffTwd_VM9xVTZFzmb_yoiM4O2HEXecTA2OkW2CySTmqsyxeQsd36fv5P2FmBls=w544-h544-l90-rj" },
  { id: "MPREb_X6N4v8Q2m", name: "Kedarnath", cover: "https://yt3.googleusercontent.com/KYw74XSQwtKPbZTrHMNEBAnEMg1P1gNGwymnZwBSjstbqSE-MpigGlTIy6IZvC-ERlRkeP0c7VTiZObS=w544-h544-l90-rj" }
];
