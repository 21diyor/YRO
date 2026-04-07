import { getStorageCoverUrl } from "@/lib/supabaseClient";

export interface Post {
  id: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  content: string;
  image: string;
  viewCount?: number;
  stats?: { label: string; value: string }[];
  engagement?: { likes: number; comments: number; reposts: number };
}

export const posts: Post[] = [
  {
    id: "youth-labor-market",
    title: "Youth Employment by Gender and Occupation",
    date: "March 2026",
    category: "Labor Market",
    summary: "Analysis of 9.71M youth aged 14–30 and gender distribution across sectors in Uzbekistan.",
    content: `Uzbekistan’s youth labor market includes 9.71 million young people aged 14–30, with more than 1.4 million currently employed. As of the latest data, male youth represent 56.3% (789,899) of employed young people, while female youth account for 43.7% (612,357).

Across sectors, education and healthcare are the most female-dominated fields, followed by administrative roles, while sales & retail, service & hospitality, manufacturing, management, and transport & logistics are predominantly male. Notably, healthcare (77.9% women) and education (66.9% women) show the strongest female representation, while transport & logistics (92.8% men) and service & hospitality (78.5% men) remain overwhelmingly male-dominated.

These patterns reflect broader structural trends in the youth labor market. Women are concentrated in social and care-oriented professions, while men dominate technical, physical, and leadership-oriented sectors. The data also highlights a gender leadership gap, with 76.2% of management roles held by men.

Addressing these imbalances requires continued efforts to expand opportunities for young people across sectors. Initiatives that encourage women to enter technical and leadership roles, while also supporting diverse career pathways for both genders, can help strengthen the inclusiveness and resilience of the youth labor market.

Which sectors do you think need more gender balance to strengthen Uzbekistan's youth labor market?

Note: Data reflects youth aged 14–30 and shows the gender distribution among currently employed youth, based on the most common occupational categories in the dataset.

Thank you to the Youth Affairs Agency - Yoshlar ishlari agentligi and Alisher Sadullaev for supporting youth research and evidence-based policymaking.`,
    image: getStorageCoverUrl("4.png"),
    stats: [
      { label: "Total Youth", value: "9.71M" },
      { label: "Male Employed", value: "56.3%" },
      { label: "Female Employed", value: "43.7%" }
    ],
    engagement: { likes: 30, comments: 4, reposts: 3 }
  },
  {
    id: "top-universities-gpa",
    title: "Top 10 Universities by Average GPA",
    date: "February 2026",
    category: "Education",
    summary: "Shahrisabz State Pedagogical Institute leads with 4.15, followed by Andijan State Institute of Foreign Languages (4.12).",
    content: `Recent analysis highlights the Top 10 national universities in Uzbekistan ranked by the average GPA of their students. The dataset includes both bachelor’s and master’s students aged 14–30, and only universities with more than 2,000 enrolled students were included to ensure comparability.

Shahrisabz State Pedagogical Institute ranks first with the highest average GPA of 4.15, followed by the Andijan State Institute of Foreign Languages (4.12). Two institutions share the next position with 4.10: Andijan State Pedagogical Institute and Namangan State Institute of Foreign Languages.

Top 10 universities by average GPA:
1. Shahrisabz State Pedagogical Institute — 4.15
2. Andijan State Institute of Foreign Languages — 4.12
3. Andijan State Pedagogical Institute — 4.10
4. Namangan State Institute of Foreign Languages — 4.10
5. University of Journalism and Mass Communications of Uzbekistan — 4.06
6. Uzbekistan State World Languages University — 4.03
7. Tashkent Medical Academy, Termez Branch — 4.02
8. Navoi State University — 4.01
9. Denov Institute of Entrepreneurship and Pedagogy of Samarkand State University — 4.01
10. Tashkent State University of Oriental Studies — 4.00

The results show strong representation of pedagogical and foreign language institutions, while universities from several regions appear in the ranking, indicating that academic excellence is not limited to major cities. The relatively narrow GPA range (4.15–4.00) also reflects growing academic competitiveness across Uzbekistan's higher education system.

Thank you to the Youth Affairs Agency - Yoshlar ishlari agentligi and Alisher Sadullaev for support.`,
    image: getStorageCoverUrl("3.png"),
    stats: [
      { label: "Top GPA", value: "4.15" },
      { label: "Institutions", value: "Top 10" },
      { label: "Min Enrollment", value: "2,000+" }
    ],
    engagement: { likes: 25, comments: 14, reposts: 2 }
  },
  {
    id: "startup-ecosystem-2026",
    title: "Uzbekistan Startup Ecosystem 2026: Where We Stand",
    date: "February 2026",
    category: "Startups",
    summary: "919 startups, $600M raised. SaaS and EdTech lead. PQ-59 targets 5,000 startups and $2B by 2030.",
    content: `Uzbekistan’s startup ecosystem has grown into a $600 million market with 919 registered startups. As of early 2026, SaaS and EdTech lead almost equally, followed by HealthTech, AI, e-commerce, and FinTech. 150 startups have raised funding, bringing total capital raised to $600M.

This growth reflects sustained efforts by national accelerators and incubators, alongside strong public–private coordination. The momentum is set to accelerate further under Presidential Resolution No. PQ-59 (February 11, 2026), which targets 5,000 startups and $2B in venture investment by 2030, with structured support from idea stage to international market entry.

The ambition is clear: a 5× scale-up in four years. Which sectors do you think need more startups to reach this goal?

Note: Data reflects registered startups in Uzbekistan as of early 2026. Funding figures represent total capital raised to date.

Thank you to the Youth Affairs Agency - Yoshlar ishlari agentligi and Alisher Sadullaev for support.`,
    image: getStorageCoverUrl("2.png"),
    stats: [
      { label: "Market Size", value: "$600M" },
      { label: "Startups", value: "919" },
      { label: "2030 Goal", value: "$2B" }
    ],
    engagement: { likes: 51, comments: 13, reposts: 4 }
  },
  {
    id: "women-in-higher-ed",
    title: "Women Surpass Men in Higher Education Enrollment",
    date: "January 2026",
    category: "Education",
    summary: "52% female, 48% male. Female master's students (39k) double male counterparts (19k) after Resolution No. 447.",
    content: `Women became the majority in Uzbekistan’s higher education system. Out of 1.78 million students, 52% are female and 48% are male. On the surface, this looks like parity. In reality, it marks a structural shift that has been building for nearly a decade. To put this in perspective, female enrollment was significantly lower in 2016. Since then, growth among women has accelerated faster than among men, overtaking male enrollment around 2023 and widening the gap thereafter.

The most striking change appears at the postgraduate level. Female master’s students (39k) now double their male counterparts (19k). This is not a coincidence, but a policy-driven outcome. Following Resolution No. 447 (2022), which introduced state-funded master’s tuition for women, financial barriers were removed for thousands of qualified candidates. Enrollment patterns responded almost immediately. For policymakers, the lesson is clear: well-targeted financial instruments can change demographic trajectories. Note: Data covers higher education enrollment in Uzbekistan up to 2025. Thank you to the Youth Affairs Agency - Yoshlar ishlari agentligi and Alisher Sadullaev for support.`,
    image: getStorageCoverUrl("1.png"),
    stats: [
      { label: "Female Ratio", value: "52%" },
      { label: "Total Students", value: "1.78M" },
      { label: "Master's (F)", value: "39k" }
    ],
    engagement: { likes: 123, comments: 12, reposts: 11 }
  }
];

export const getPostById = (id: string) => posts.find((p) => p.id === id);

export type FilterTab = 'latest' | 'top' | 'discussions';

const MONTH_ORDER: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
};

const parseDate = (dateStr: string): number => {
  const [month, year] = dateStr.split(' ');
  const m = MONTH_ORDER[month] ?? 0;
  const y = parseInt(year || '0', 10);
  return y * 100 + m;
};

export const getFilteredPosts = (filter: FilterTab, excludeFeatured = false): Post[] => {
  let list = [...posts];
  if (excludeFeatured && list.length > 0) {
    list = list.slice(1);
  }
  switch (filter) {
    case 'latest':
      return list.sort((a, b) => parseDate(b.date) - parseDate(a.date));
    case 'top':
      return list.sort((a, b) => {
        const scoreA = (a.engagement?.likes ?? 0) + (a.engagement?.comments ?? 0) + (a.engagement?.reposts ?? 0);
        const scoreB = (b.engagement?.likes ?? 0) + (b.engagement?.comments ?? 0) + (b.engagement?.reposts ?? 0);
        return scoreB - scoreA;
      });
    case 'discussions':
      return list.sort((a, b) => (b.engagement?.comments ?? 0) - (a.engagement?.comments ?? 0));
    default:
      return list;
  }
};
