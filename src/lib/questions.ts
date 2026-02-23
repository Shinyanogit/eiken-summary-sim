export interface Question {
  id: number;
  paragraphs: string[];
}

export const questions: Question[] = [
  {
    id: 1,
    paragraphs: [
      "In many countries, blood donation programs are commonplace, and some people donate regularly. Donations are usually made at blood banks in hospitals or similar facilities. However, some countries around the world are not so fortunate. They have a shortage of donated blood. Blood and products made from it need to be stored in refrigerated conditions, ready to be used right away. Unfortunately, these countries lack the funds required to build and maintain the necessary infrastructure. As a result, their hospitals are facing difficulties in providing services.",
      "Blood and blood products are essential for many people in life-threatening circumstances, such as accident victims or people requiring major surgery, but their importance goes beyond such situations. They are also critical in the treatment of some chronic diseases and pregnancy complications. When hospitals have adequate medical facilities and supplies, including blood and blood products, these conditions may not be considered immediately life-threatening. However, a lack of such resources has serious consequences for many health-care facilities. They are witnessing a higher percentage of deaths for people with these conditions.",
      "Medical experts are aware of the urgent need for alternatives to refrigerated storage facilities. They have been searching for innovative ways to make blood more accessible in underserved and remote areas. One approach is to create networks of volunteer donors. These are community members willing to assemble and donate quickly when called upon to help. Their blood could then be taken and used immediately. However, concerns have been raised about this method. In some regions, diseases that can be spread through blood transfusions, such as hepatitis, are relatively common. As such, careful blood testing is essential to ensure that no harm will be caused to recipients. In places with limited resources, however, some people say maintaining supplies and conducting such procedures properly can be extremely challenging. This can cause the test results to be incorrect.",
    ],
  },
  {
    id: 2,
    paragraphs: [
      "The rapid advancement of artificial intelligence has sparked widespread debate about its impact on employment. Proponents argue that AI will create new categories of jobs that we cannot yet imagine, much as the internet did in the 1990s. They point to historical precedents where technological revolutions initially caused disruption but ultimately led to greater prosperity and more diverse employment opportunities. Many economists support this view, noting that automation tends to complement human labor rather than replace it entirely.",
      "Critics, however, warn that the current wave of AI development is fundamentally different from previous technological shifts. Unlike earlier automation, which primarily affected manual and repetitive tasks, modern AI systems are increasingly capable of performing cognitive work traditionally done by highly educated professionals. Legal analysis, medical diagnosis, financial planning, and even creative writing are all areas where AI has demonstrated remarkable proficiency. This raises concerns that middle-class professionals, who previously felt secure in their careers, may face unprecedented competition from machines.",
      "Some researchers propose a middle ground, suggesting that the future of work will involve human-AI collaboration rather than outright replacement. In this vision, professionals who learn to effectively leverage AI tools will become significantly more productive, while those who resist adaptation may find themselves at a disadvantage. Educational institutions are beginning to respond to this shift by incorporating AI literacy into their curricula. Nevertheless, the pace of AI development continues to outstrip the ability of educational systems and labor markets to adapt, leaving many workers uncertain about their long-term prospects.",
    ],
  },
  {
    id: 3,
    paragraphs: [
      "Japan's declining birth rate has become one of the most pressing social issues facing the nation. In 2023, the number of births fell below 800,000 for the first time in recorded history, continuing a trend that has accelerated over the past decade. The government has responded with various initiatives, including increased childcare subsidies, expanded parental leave policies, and financial incentives for families with multiple children. Despite these efforts, demographic projections suggest that the population could shrink by nearly one-third by 2060.",
      "Experts identify multiple factors contributing to this decline. The rising cost of living in urban areas, particularly housing and education expenses, makes raising children financially burdensome for many young couples. Additionally, changing social attitudes toward marriage and parenthood have led many young people to delay or forgo starting families altogether. The demanding work culture prevalent in many Japanese companies leaves little time for personal relationships, and women increasingly prioritize career advancement over traditional family roles. These cultural and economic factors create a complex web of disincentives for having children.",
      "Some analysts argue that immigration could partially offset the effects of population decline, pointing to countries like Canada and Australia that have successfully used immigration to maintain economic growth. However, Japan has historically been reluctant to embrace large-scale immigration, citing concerns about cultural cohesion and social integration. Recent policy changes have made it somewhat easier for skilled foreign workers to obtain residency, but the scale of immigration remains far below what would be needed to reverse demographic trends. Meanwhile, some local governments in rural areas have developed creative solutions, such as offering free housing and generous relocation subsidies to attract young families from overcrowded cities.",
    ],
  },
];

export function getRandomQuestion(): Question {
  return questions[Math.floor(Math.random() * questions.length)];
}
