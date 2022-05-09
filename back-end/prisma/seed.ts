import { prisma } from "../src/database.js";

async function main() {
  //upsert = update/insert
  //melhor que create por que pode dar conflito em campos unicos
  await prisma.recommendation.createMany({
    data: [{ name: "Falamansa - Xote dos Milagres", "youtubeLink": "https://www.youtube.com/watch?v=chwyjJbcs1Y", score: 100 }, 
          { name: "Malvadão 3 - Xamã | Bia Marques (cover)", "youtubeLink": "https://www.youtube.com/watch?v=aFSkc2uCtW0", score: 453 }, 
          { name: "L7NNON - Da Boca (prod. Papatinho)", "youtubeLink": "https://www.youtube.com/watch?v=HOiNsKhcvv4", score: 300 }],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
