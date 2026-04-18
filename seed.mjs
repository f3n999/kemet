import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { config } = require('dotenv');
config();

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const events = [
  { year: -5500, displayDate: "vers 5500 av. J.-C.", period: "prehistoire", title: "Premières cultures néolithiques", description: "Les civilisations de Badari et de Nagada s'établissent le long du Nil. Agriculture, poterie et premiers rites funéraires apparaissent." },
  { year: -3150, displayDate: "vers 3150 av. J.-C.", period: "prehistoire", title: "Unification de la Haute et Basse Égypte", description: "Le roi Narmer (parfois assimilé à Ménès) unifie les Deux Terres et fonde la première dynastie. Naissance de l'État pharaonique." },
  { year: -2700, displayDate: "vers 2700 av. J.-C.", period: "ancien", title: "IIIᵉ dynastie — l'âge des bâtisseurs", description: "Le pharaon Djéser et son architecte Imhotep érigent la pyramide à degrés de Saqqara, premier monument monumental en pierre de l'humanité." },
  { year: -2560, displayDate: "vers 2560 av. J.-C.", period: "ancien", title: "Construction de la grande pyramide de Khéops", description: "Plus de 2,3 millions de blocs assemblés sur le plateau de Gizeh. Plus haute construction humaine pendant près de 4000 ans." },
  { year: -2500, displayDate: "vers 2500 av. J.-C.", period: "ancien", title: "Le Sphinx de Gizeh", description: "Sculpté sous Khéphren, le Grand Sphinx garde le plateau funéraire. Symbole intemporel de la puissance pharaonique." },
  { year: -2181, displayDate: "vers 2181 av. J.-C.", period: "ancien", title: "Effondrement de l'Ancien Empire", description: "Sécheresses, baisse des crues du Nil et affaiblissement du pouvoir central plongent l'Égypte dans la Première Période Intermédiaire." },
  { year: -2055, displayDate: "vers 2055 av. J.-C.", period: "moyen", title: "Réunification par Montouhotep II", description: "Le roi thébain restaure l'unité du pays. Début du Moyen Empire, considéré comme l'âge d'or de la littérature égyptienne." },
  { year: -1650, displayDate: "vers 1650 av. J.-C.", period: "moyen", title: "Invasion des Hyksos", description: "Les Hyksos, peuple d'Asie occidentale, conquièrent le Delta du Nil et introduisent le cheval, le char de guerre et de nouvelles techniques métallurgiques." },
  { year: -1550, displayDate: "vers 1550 av. J.-C.", period: "nouvel", title: "Fondation du Nouvel Empire", description: "Ahmôsis Ier chasse les Hyksos et unifie l'Égypte. Début de la période la plus florissante de l'histoire pharaonique." },
  { year: -1479, displayDate: "vers 1479 av. J.-C.", period: "nouvel", title: "Règne d'Hatchepsout", description: "D'abord régente, puis pharaon à part entière. Elle lance une expédition commerciale au pays de Pount et bâtit le temple de Deir el-Bahari." },
  { year: -1353, displayDate: "vers 1353 av. J.-C.", period: "nouvel", title: "Révolution amarnienne d'Akhenaton", description: "Amenhotep IV prend le nom d'Akhenaton, instaure le culte exclusif d'Aton et fonde la nouvelle capitale Akhetaton (Amarna). Rupture religieuse et artistique totale." },
  { year: -1332, displayDate: "vers 1332 av. J.-C.", period: "nouvel", title: "Règne de Toutânkhamon", description: "Le jeune roi restaure les anciens cultes après la révolution amarnienne. Sa tombe, découverte quasi intacte en 1922, devient le symbole de l'Égypte antique." },
  { year: -1279, displayDate: "vers 1279 av. J.-C.", period: "nouvel", title: "Règne de Ramsès II", description: "Le plus long règne de l'histoire pharaonique : 67 ans. Batailles de Qadesh, traité de paix avec les Hittites, construction d'Abou Simbel." },
  { year: -1070, displayDate: "vers 1070 av. J.-C.", period: "tardif", title: "Fin du Nouvel Empire", description: "Affaibli par les invasions des Peuples de la Mer et les luttes internes, le Nouvel Empire s'effondre. L'Égypte entre dans la Troisième Période Intermédiaire." },
  { year: -525, displayDate: "525 av. J.-C.", period: "tardif", title: "Conquête perse de Cambyse II", description: "L'Égypte devient une satrapie de l'Empire achéménide. Fin de la dernière dynastie pharaonique autochtone." },
  { year: -332, displayDate: "332 av. J.-C.", period: "greco", title: "Conquête d'Alexandre le Grand", description: "Alexandre entre en Égypte sans résistance. Il est accueilli comme un libérateur et fonde Alexandrie, destinée à devenir le carrefour intellectuel du monde antique." },
  { year: -305, displayDate: "305 av. J.-C.", period: "greco", title: "Fondation de la dynastie ptolémaïque", description: "Ptolémée Ier Sôter, général d'Alexandre, se proclame roi d'Égypte. La dynastie ptolémaïque règnera jusqu'à Cléopâtre VII." },
  { year: -51, displayDate: "51 av. J.-C.", period: "greco", title: "Règne de Cléopâtre VII", description: "Dernière reine de la dynastie ptolémaïque, maîtresse de César puis de Marc Antoine. Sa mort en 30 av. J.-C. marque la fin de l'Égypte pharaonique." },
  { year: -30, displayDate: "30 av. J.-C.", period: "greco", title: "Égypte province romaine", description: "Après la défaite de Marc Antoine et Cléopâtre face à Octave, l'Égypte devient une province de l'Empire romain. Fin de trois mille ans de civilisation pharaonique." },
  { year: 1798, displayDate: "1798 apr. J.-C.", period: "moderne", title: "Expédition de Bonaparte en Égypte", description: "L'expédition française en Égypte (1798-1801) marque la naissance de l'égyptologie moderne. La Description de l'Égypte documente monuments et inscriptions." },
  { year: 1822, displayDate: "1822 apr. J.-C.", period: "moderne", title: "Déchiffrement des hiéroglyphes", description: "Jean-François Champollion déchiffre les hiéroglyphes grâce à la pierre de Rosette. L'histoire de l'Égypte ancienne peut enfin être lue dans ses propres textes." },
  { year: 1922, displayDate: "1922 apr. J.-C.", period: "moderne", title: "Découverte de la tombe de Toutânkhamon", description: "Howard Carter découvre la KV62 dans la Vallée des Rois. Le trésor intact révolutionne la compréhension de l'art et des rites funéraires du Nouvel Empire." },
];

const pharaohs = [
  { name: "Djéser", dynasty: "IIIᵉ dynastie", date: "vers −2670 av. J.-C.", slug: "djoser", description: "Avec son architecte Imhotep, il fait construire la pyramide à degrés de Saqqara, premier monument monumental en pierre de toute l'humanité." },
  { name: "Khéops (Khoufou)", dynasty: "IVᵉ dynastie", date: "vers −2580 av. J.-C.", slug: "kheops", description: "Bâtisseur de la grande pyramide de Gizeh, plus haute construction humaine pendant près de 4 000 ans. Peu de traces du souverain, beaucoup de sa machine d'État." },
  { name: "Hatchepsout", dynasty: "XVIIIᵉ dynastie", date: "vers −1479 av. J.-C.", slug: "hatchepsout", description: "D'abord régente, puis pharaon à part entière. Expédition au pays de Pount, temple de Deir el-Bahari, vingt ans de paix — puis un effacement posthume méthodique." },
  { name: "Thoutmôsis III", dynasty: "XVIIIᵉ dynastie", date: "vers −1479 av. J.-C.", slug: "thoutmosis-iii", description: "Surnommé le « Napoléon de l'Égypte ». Dix-sept campagnes, victoire à Megiddo, empire jusqu'à l'Euphrate. Le premier général dont on possède les carnets." },
  { name: "Akhenaton", dynasty: "XVIIIᵉ dynastie", date: "vers −1353 av. J.-C.", slug: "akhenaton", description: "L'iconoclaste. Culte exclusif d'Aton, nouvelle capitale à Amarna, rupture artistique totale. Effacé à sa mort, redécouvert par l'archéologie." },
  { name: "Toutânkhamon", dynasty: "XVIIIᵉ dynastie", date: "vers −1332 av. J.-C.", slug: "toutankhamon", description: "Mort à 19 ans, oublié pendant 32 siècles, redécouvert en 1922. Un règne bref, un tombeau presque intact, et l'image la plus iconique de toute l'Égypte antique." },
  { name: "Ramsès II", dynasty: "XIXᵉ dynastie", date: "vers −1279 av. J.-C.", slug: "ramses-ii", description: "67 ans de règne, la bataille de Qadesh, le premier traité de paix de l'histoire et les colosses d'Abou Simbel. Le pharaon de toutes les représentations." },
  { name: "Cléopâtre VII", dynasty: "Dynastie ptolémaïque", date: "51 av. J.-C.", slug: "cleopatre-vii", description: "Dernière souveraine d'une lignée hellénistique, première à parler égyptien. Alliée de César, puis d'Antoine. Sa mort clôt trois mille ans de royauté pharaonique." },
  { name: "Nefertiti", dynasty: "XVIIIᵉ dynastie", date: "vers −1370 av. J.-C.", slug: "nefertiti", description: "Grande épouse royale d'Akhenaton et co-régente possible. Son buste de calcaire, découvert à Amarna en 1912, est l'un des portraits les plus célèbres de l'Antiquité." },
];

async function main() {
  console.log('Nettoyage des données existantes…');
  await prisma.contactMessage.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.pharaoh.deleteMany();

  console.log('Insertion des événements…');
  await prisma.timelineEvent.createMany({ data: events });

  console.log('Insertion des pharaons…');
  await prisma.pharaoh.createMany({ data: pharaohs });

  const evCount = await prisma.timelineEvent.count();
  const phCount = await prisma.pharaoh.count();
  console.log(`✓ ${evCount} événements et ${phCount} pharaons insérés.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
