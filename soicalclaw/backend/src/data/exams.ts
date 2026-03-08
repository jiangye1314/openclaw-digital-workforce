import { Exam, Level } from '../types';

export const EXAMS: Exam[] = [
  // ============ 学徒级考试 ============
  {
    id: 'apprentice-01',
    level: 'apprentice',
    title: '小龙虾基础知识入门',
    description: '了解小龙虾的基本生物学特征和生活习性',
    passingScore: 60,
    timeLimit: 15,
    experienceReward: 50,
    prerequisites: [],
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: '小龙虾的原产地是哪里？',
        options: [
          { id: 'a', text: '中国' },
          { id: 'b', text: '美国路易斯安那州' },
          { id: 'c', text: '澳大利亚' },
          { id: 'd', text: '巴西' }
        ],
        correctAnswers: ['b'],
        explanation: '小龙虾原产于美国路易斯安那州，后来引入中国。',
        points: 20
      },
      {
        id: 'q2',
        type: 'single',
        question: '小龙虾属于什么科？',
        options: [
          { id: 'a', text: '对虾科' },
          { id: 'b', text: '龙虾科' },
          { id: 'c', text: '蝲蛄科' },
          { id: 'd', text: '寄居蟹科' }
        ],
        correctAnswers: ['c'],
        explanation: '小龙虾属于蝲蛄科（Cambaridae）。',
        points: 20
      },
      {
        id: 'q3',
        type: 'truefalse',
        question: '小龙虾是杂食性动物，既吃植物也吃动物性食物。',
        options: [
          { id: 'true', text: '正确' },
          { id: 'false', text: '错误' }
        ],
        correctAnswers: ['true'],
        explanation: '小龙虾确实是杂食性动物，食物包括水草、藻类、昆虫、小鱼虾等。',
        points: 20
      },
      {
        id: 'q4',
        type: 'single',
        question: '小龙虾适宜的生长水温是多少？',
        options: [
          { id: 'a', text: '5-10°C' },
          { id: 'b', text: '15-25°C' },
          { id: 'c', text: '30-35°C' },
          { id: 'd', text: '40°C以上' }
        ],
        correctAnswers: ['b'],
        explanation: '小龙虾最适宜的生长水温是15-25°C。',
        points: 20
      },
      {
        id: 'q5',
        type: 'multiple',
        question: '小龙虾的生长需要哪些环境条件？（多选）',
        options: [
          { id: 'a', text: '清洁的水质' },
          { id: 'b', text: '充足的光照' },
          { id: 'c', text: '适量的水草' },
          { id: 'd', text: '隐蔽的洞穴' }
        ],
        correctAnswers: ['a', 'c', 'd'],
        explanation: '小龙虾需要清洁的水质、适量水草作为食物和庇护所，以及隐蔽的洞穴进行蜕壳。',
        points: 20
      }
    ]
  },
  {
    id: 'apprentice-02',
    level: 'apprentice',
    title: '虾塘建设基础',
    description: '学习虾塘选址、建设和管理的基本知识',
    passingScore: 60,
    timeLimit: 15,
    experienceReward: 50,
    prerequisites: ['apprentice-01'],
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: '新建虾塘时，塘底的最佳土质是什么？',
        options: [
          { id: 'a', text: '纯沙土' },
          { id: 'b', text: '粘土' },
          { id: 'c', text: '壤土（黏土和沙土混合）' },
          { id: 'd', text: '岩石' }
        ],
        correctAnswers: ['c'],
        explanation: '壤土既能保水又能透气，最适合虾塘建设。',
        points: 25
      },
      {
        id: 'q2',
        type: 'single',
        question: '虾塘水深一般控制在多少比较合适？',
        options: [
          { id: 'a', text: '0.3-0.5米' },
          { id: 'b', text: '0.8-1.5米' },
          { id: 'c', text: '2-3米' },
          { id: 'd', text: '越深越好' }
        ],
        correctAnswers: ['b'],
        explanation: '虾塘水深一般控制在0.8-1.5米，过浅温度变化大，过深不利于水草生长。',
        points: 25
      },
      {
        id: 'q3',
        type: 'multiple',
        question: '虾塘进排水系统应该具备哪些特点？（多选）',
        options: [
          { id: 'a', text: '独立设置进水口和排水口' },
          { id: 'b', text: '设置过滤网防止敌害生物进入' },
          { id: 'c', text: '能够完全排干塘水' },
          { id: 'd', text: '进水口和排水口可以共用' }
        ],
        correctAnswers: ['a', 'b', 'c'],
        explanation: '进排水系统需要独立设置、有过滤网、能排干塘水，便于管理和清塘。',
        points: 25
      },
      {
        id: 'q4',
        type: 'single',
        question: '虾塘四周应该设置什么防止小龙虾逃逸？',
        options: [
          { id: 'a', text: '塑料薄膜防逃墙' },
          { id: 'b', text: '铁丝网' },
          { id: 'c', text: '光滑的防逃板或瓷砖' },
          { id: 'd', text: '不需要设置' }
        ],
        correctAnswers: ['c'],
        explanation: '需要设置光滑的防逃墙，小龙虾无法在光滑表面攀爬。',
        points: 25
      }
    ]
  },

  // ============ 初级考试 ============
  {
    id: 'junior-01',
    level: 'junior',
    title: '苗种投放与管理',
    description: '学习虾苗选择、投放时机和早期管理',
    passingScore: 65,
    timeLimit: 20,
    experienceReward: 100,
    prerequisites: ['apprentice-01', 'apprentice-02'],
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: '虾苗投放的最佳规格一般是每千克多少尾？',
        options: [
          { id: 'a', text: '50-100尾/千克' },
          { id: 'b', text: '150-300尾/千克' },
          { id: 'c', text: '500-800尾/千克' },
          { id: 'd', text: '1000尾以上/千克' }
        ],
        correctAnswers: ['b'],
        explanation: '150-300尾/千克的虾苗规格适中，成活率较高，生长速度快。',
        points: 20
      },
      {
        id: 'q2',
        type: 'single',
        question: '虾苗投放时水温差不能超过多少度？',
        options: [
          { id: 'a', text: '1°C' },
          { id: 'b', text: '3°C' },
          { id: 'c', text: '5°C' },
          { id: 'd', text: '10°C' }
        ],
        correctAnswers: ['b'],
        explanation: '水温差不能超过3°C，温差过大会导致虾苗应激死亡。',
        points: 20
      },
      {
        id: 'q3',
        type: 'multiple',
        question: '优质的虾苗应该具备哪些特征？（多选）',
        options: [
          { id: 'a', text: '规格整齐' },
          { id: 'b', text: '附肢完整' },
          { id: 'c', text: '反应敏捷' },
          { id: 'd', text: '体色暗淡' }
        ],
        correctAnswers: ['a', 'b', 'c'],
        explanation: '优质虾苗规格整齐、附肢完整、反应敏捷、体色鲜艳有光泽。',
        points: 20
      },
      {
        id: 'q4',
        type: 'single',
        question: '虾苗投放密度一般每亩多少尾合适？',
        options: [
          { id: 'a', text: '2000-4000尾' },
          { id: 'b', text: '6000-10000尾' },
          { id: 'c', text: '15000-20000尾' },
          { id: 'd', text: '30000尾以上' }
        ],
        correctAnswers: ['b'],
        explanation: '一般每亩投放6000-10000尾，具体根据塘口条件和管理水平调整。',
        points: 20
      },
      {
        id: 'q5',
        type: 'truefalse',
        question: '虾苗可以直接从袋子倒入塘中，不需要缓苗处理。',
        options: [
          { id: 'true', text: '正确' },
          { id: 'false', text: '错误' }
        ],
        correctAnswers: ['false'],
        explanation: '虾苗需要缓苗处理，先将装苗袋放在塘中适应水温15-20分钟，再逐渐加入塘水，最后放苗。',
        points: 20
      }
    ]
  },
  {
    id: 'junior-02',
    level: 'junior',
    title: '饲料投喂技术',
    description: '掌握小龙虾饲料种类、投喂方法和注意事项',
    passingScore: 65,
    timeLimit: 20,
    experienceReward: 100,
    prerequisites: ['junior-01'],
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: '小龙虾幼虾阶段（3cm以下）最适合的饲料蛋白质含量是多少？',
        options: [
          { id: 'a', text: '15-20%' },
          { id: 'b', text: '25-30%' },
          { id: 'c', text: '35-40%' },
          { id: 'd', text: '45%以上' }
        ],
        correctAnswers: ['c'],
        explanation: '幼虾阶段需要高蛋白饲料，蛋白质含量应在35-40%。',
        points: 25
      },
      {
        id: 'q2',
        type: 'multiple',
        question: '小龙虾的投喂应该遵循什么原则？（多选）',
        options: [
          { id: 'a', text: '定时' },
          { id: 'b', text: '定位' },
          { id: 'c', text: '定质' },
          { id: 'd', text: '定量' }
        ],
        correctAnswers: ['a', 'b', 'c', 'd'],
        explanation: '投喂要遵循"四定"原则：定时、定位、定质、定量。',
        points: 25
      },
      {
        id: 'q3',
        type: 'single',
        question: '水温低于多少度时应该减少或停止投喂？',
        options: [
          { id: 'a', text: '20°C' },
          { id: 'b', text: '15°C' },
          { id: 'c', text: '10°C' },
          { id: 'd', text: '5°C' }
        ],
        correctAnswers: ['c'],
        explanation: '水温低于10°C时小龙虾摄食量大幅减少，应减少或停止投喂。',
        points: 25
      },
      {
        id: 'q4',
        type: 'single',
        question: '配合饲料和天然饵料的比例应该控制在多少？',
        options: [
          { id: 'a', text: '全部喂配合饲料' },
          { id: 'b', text: '全部喂天然饵料' },
          { id: 'c', text: '配合饲料为主，适当补充天然饵料' },
          { id: 'd', text: '无所谓，有什么喂什么' }
        ],
        correctAnswers: ['c'],
        explanation: '应以配合饲料为主，适当补充螺蚌肉、杂鱼等天然饵料，保证营养均衡。',
        points: 25
      }
    ]
  },

  // ============ 中级考试 ============
  {
    id: 'intermediate-01',
    level: 'intermediate',
    title: '水质管理进阶',
    description: '深入学习水质调控、监测和常见问题处理',
    passingScore: 70,
    timeLimit: 25,
    experienceReward: 200,
    prerequisites: ['junior-01', 'junior-02'],
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: '小龙虾养殖水体的pH值应该控制在什么范围？',
        options: [
          { id: 'a', text: '5.0-6.0' },
          { id: 'b', text: '6.5-8.5' },
          { id: 'c', text: '9.0-10.0' },
          { id: 'd', text: '越低越好' }
        ],
        correctAnswers: ['b'],
        explanation: '最适pH值为6.5-8.5，过低或过高都会影响小龙虾的生长。',
        points: 20
      },
      {
        id: 'q2',
        type: 'single',
        question: '水体溶氧量低于多少时小龙虾会出现浮头？',
        options: [
          { id: 'a', text: '5mg/L' },
          { id: 'b', text: '3mg/L' },
          { id: 'c', text: '1mg/L' },
          { id: 'd', text: '10mg/L' }
        ],
        correctAnswers: ['b'],
        explanation: '溶氧量低于3mg/L时小龙虾会出现浮头，低于1.5mg/L会导致大量死亡。',
        points: 20
      },
      {
        id: 'q3',
        type: 'multiple',
        question: '水体富营养化的主要表现有哪些？（多选）',
        options: [
          { id: 'a', text: '水体呈浓绿色或蓝绿色' },
          { id: 'b', text: '水华（藻类大量繁殖）' },
          { id: 'c', text: '鱼虾活力下降' },
          { id: 'd', text: '水体透明度高' }
        ],
        correctAnswers: ['a', 'b', 'c'],
        explanation: '富营养化表现为水色异常、水华、鱼虾活力下降、透明度降低等。',
        points: 20
      },
      {
        id: 'q4',
        type: 'single',
        question: '氨氮含量超过多少会对小龙虾产生毒性？',
        options: [
          { id: 'a', text: '0.1mg/L' },
          { id: 'b', text: '0.5mg/L' },
          { id: 'c', text: '1.0mg/L' },
          { id: 'd', text: '5.0mg/L' }
        ],
        correctAnswers: ['b'],
        explanation: '氨氮超过0.5mg/L会产生慢性毒性，超过2mg/L会造成急性中毒。',
        points: 20
      },
      {
        id: 'q5',
        type: 'multiple',
        question: '改善水质的有效措施包括哪些？（多选）',
        options: [
          { id: 'a', text: '定期换水' },
          { id: 'b', text: '使用有益菌制剂' },
          { id: 'c', text: '种植水生植物' },
          { id: 'd', text: '大量使用消毒剂' }
        ],
        correctAnswers: ['a', 'b', 'c'],
        explanation: '定期换水、使用EM菌等有益菌、种植水草都能改善水质，但大量使用消毒剂会破坏水体生态平衡。',
        points: 20
      }
    ]
  },
  {
    id: 'intermediate-02',
    level: 'intermediate',
    title: '疾病诊断与防治',
    description: '掌握常见病害的识别、诊断和防治方法',
    passingScore: 70,
    timeLimit: 25,
    experienceReward: 200,
    prerequisites: ['intermediate-01'],
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: '小龙虾"黑鳃病"的主要原因是什么？',
        options: [
          { id: 'a', text: '细菌感染' },
          { id: 'b', text: '水质恶化，鳃部附着有机物' },
          { id: 'c', text: '病毒感染' },
          { id: 'd', text: '营养不良' }
        ],
        correctAnswers: ['b'],
        explanation: '黑鳃病主要由水质恶化引起，鳃部附着有机物和细菌，导致鳃丝发黑。',
        points: 20
      },
      {
        id: 'q2',
        type: 'single',
        question: '小龙虾发生"纤毛虫病"时，体表会有什么特征？',
        options: [
          { id: 'a', text: '出现白斑' },
          { id: 'b', text: '体表附着绒毛状物，行动迟缓' },
          { id: 'c', text: '甲壳变软' },
          { id: 'd', text: '眼睛发白' }
        ],
        correctAnswers: ['b'],
        explanation: '纤毛虫病表现为体表附着绒毛状纤毛虫，虾体行动迟缓，体表脏污。',
        points: 20
      },
      {
        id: 'q3',
        type: 'multiple',
        question: '预防小龙虾疾病的主要措施包括哪些？（多选）',
        options: [
          { id: 'a', text: '保持良好水质' },
          { id: 'b', text: '合理放养密度' },
          { id: 'c', text: '定期消毒' },
          { id: 'd', text: '投喂变质饲料' }
        ],
        correctAnswers: ['a', 'b', 'c'],
        explanation: '保持良好水质、合理密度、定期消毒、投喂新鲜饲料是防病关键。',
        points: 20
      },
      {
        id: 'q4',
        type: 'single',
        question: '发现病虾后首先应该做什么？',
        options: [
          { id: 'a', text: '立即全池泼洒抗生素' },
          { id: 'b', text: '捞取病虾进行诊断，隔离处理' },
          { id: 'c', text: '加大换水量' },
          { id: 'd', text: '停止投喂' }
        ],
        correctAnswers: ['b'],
        explanation: '首先要捞取病虾诊断病因，隔离病虾防止传染，再对症下药。',
        points: 20
      },
      {
        id: 'q5',
        type: 'multiple',
        question: '以下哪些情况容易导致小龙虾发病？（多选）',
        options: [
          { id: 'a', text: '水质突变' },
          { id: 'b', text: '机械损伤' },
          { id: 'c', text: '密度过高' },
          { id: 'd', text: '定期换水' }
        ],
        correctAnswers: ['a', 'b', 'c'],
        explanation: '水质突变、机械损伤、密度过高等应激因素容易导致小龙虾发病。',
        points: 20
      }
    ]
  },

  // ============ 高级考试 ============
  {
    id: 'advanced-01',
    level: 'advanced',
    title: '规模化养殖管理',
    description: '学习大规模虾场的设计、管理和运营',
    passingScore: 75,
    timeLimit: 30,
    experienceReward: 400,
    prerequisites: ['intermediate-01', 'intermediate-02'],
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: '规模化养殖场中，不同生长阶段的虾是否应该分开养殖？',
        options: [
          { id: 'a', text: '不需要，可以混养' },
          { id: 'b', text: '应该分塘养殖，避免大欺小' },
          { id: 'c', text: '只有病虾需要分开' },
          { id: 'd', text: '无所谓' }
        ],
        correctAnswers: ['b'],
        explanation: '规模化养殖应该分阶段养殖，避免大小差异导致的残食，也便于精准管理。',
        points: 25
      },
      {
        id: 'q2',
        type: 'multiple',
        question: '虾场建设的规划要点包括哪些？（多选）',
        options: [
          { id: 'a', text: '交通便利' },
          { id: 'b', text: '水源充足且无污染' },
          { id: 'c', text: '电力供应稳定' },
          { id: 'd', text: '地势低洼易积水' }
        ],
        correctAnswers: ['a', 'b', 'c'],
        explanation: '虾场选址要考虑交通、水源、电力等，地势应稍高便于排水，不能选低洼易积水处。',
        points: 25
      },
      {
        id: 'q3',
        type: 'single',
        question: '稻虾共作模式中，水稻收割后应该如何处理秸秆？',
        options: [
          { id: 'a', text: '直接留在田里腐烂作肥料' },
          { id: 'b', text: '全部清理出田' },
          { id: 'c', text: '收割高留茬，秸秆粉碎还田' },
          { id: 'd', text: '焚烧处理' }
        ],
        correctAnswers: ['c'],
        explanation: '稻虾共作应高留茬（30-40cm），秸秆粉碎还田，既作肥料又为虾提供栖息场所。',
        points: 25
      },
      {
        id: 'q4',
        type: 'multiple',
        question: '规模化养殖的成本控制措施包括哪些？（多选）',
        options: [
          { id: 'a', text: '自繁苗种降低采购成本' },
          { id: 'b', text: '科学投喂减少浪费' },
          { id: 'c', text: '预防疾病减少损失' },
          { id: 'd', text: '使用廉价劣质饲料' }
        ],
        correctAnswers: ['a', 'b', 'c'],
        explanation: '成本控制应通过自繁苗种、科学投喂、疾病预防等方式，不能牺牲质量使用劣质饲料。',
        points: 25
      }
    ]
  },
  {
    id: 'advanced-02',
    level: 'advanced',
    title: '繁殖与育种技术',
    description: '掌握小龙虾人工繁殖、苗种培育技术',
    passingScore: 75,
    timeLimit: 30,
    experienceReward: 400,
    prerequisites: ['advanced-01'],
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: '小龙虾繁殖时，雌雄比例一般控制在多少？',
        options: [
          { id: 'a', text: '1:1' },
          { id: 'b', text: '1:2-1:3（雄:雌）' },
          { id: 'c', text: '1:5' },
          { id: 'd', text: '全部养雌虾' }
        ],
        correctAnswers: ['b'],
        explanation: '繁殖时雌雄比例一般为1:2到1:3，即1只雄虾配2-3只雌虾。',
        points: 25
      },
      {
        id: 'q2',
        type: 'single',
        question: '小龙虾的抱卵量一般每尾多少粒？',
        options: [
          { id: 'a', text: '几十粒' },
          { id: 'b', text: '100-500粒' },
          { id: 'c', text: '1000-5000粒' },
          { id: 'd', text: '10000粒以上' }
        ],
        correctAnswers: ['b'],
        explanation: '小龙虾抱卵量与体重相关，一般每尾100-500粒，体长10cm以上的可达700粒以上。',
        points: 25
      },
      {
        id: 'q3',
        type: 'multiple',
        question: '提高小龙虾繁殖率的措施有哪些？（多选）',
        options: [
          { id: 'a', text: '选择优良亲本' },
          { id: 'b', text: '提供隐蔽洞穴' },
          { id: 'c', text: '控制适宜水温' },
          { id: 'd', text: '频繁惊扰亲虾' }
        ],
        correctAnswers: ['a', 'b', 'c'],
        explanation: '应选择优良亲本、提供洞穴、控制水温（20-28°C），避免惊扰。',
        points: 25
      },
      {
        id: 'q4',
        type: 'single',
        question: '小龙虾苗种培育池中，早期苗种（幼体）主要以什么为食？',
        options: [
          { id: 'a', text: '配合饲料' },
          { id: 'b', text: '浮游生物、藻类和有机碎屑' },
          { id: 'c', text: '小鱼虾' },
          { id: 'd', text: '不需要喂食' }
        ],
        correctAnswers: ['b'],
        explanation: '幼体阶段主要摄食浮游生物、藻类和有机碎屑，需要培育肥水。',
        points: 25
      }
    ]
  },

  // ============ 专家级考试 ============
  {
    id: 'expert-01',
    level: 'expert',
    title: '创新养殖模式',
    description: '学习先进的养殖模式和技术创新',
    passingScore: 80,
    timeLimit: 35,
    experienceReward: 800,
    prerequisites: ['advanced-01', 'advanced-02'],
    questions: [
      {
        id: 'q1',
        type: 'multiple',
        question: '工厂化循环水养殖的优势有哪些？（多选）',
        options: [
          { id: 'a', text: '节水环保' },
          { id: 'b', text: '可全年生产' },
          { id: 'c', text: '产量高且稳定' },
          { id: 'd', text: '投资成本低' }
        ],
        correctAnswers: ['a', 'b', 'c'],
        explanation: '工厂化养殖节水、可全年生产、产量高稳定，但投资成本较高。',
        points: 25
      },
      {
        id: 'q2',
        type: 'single',
        question: '"稻虾共作"模式中，水稻插秧的最佳时间是什么时候？',
        options: [
          { id: 'a', text: '随时可以' },
          { id: 'b', text: '小龙虾全部出售后' },
          { id: 'c', text: '5-6月份，小龙虾钻洞避暑期间' },
          { id: 'd', text: '冬季' }
        ],
        correctAnswers: ['c'],
        explanation: '5-6月小龙虾钻洞避暑是插秧的好时机，可减少对小龙虾的惊扰。',
        points: 25
      },
      {
        id: 'q3',
        type: 'multiple',
        question: '智能化养殖系统包括哪些技术？（多选）',
        options: [
          { id: 'a', text: '水质在线监测' },
          { id: 'b', text: '自动投喂系统' },
          { id: 'c', text: '视频监控' },
          { id: 'd', text: '人工巡塘' }
        ],
        correctAnswers: ['a', 'b', 'c'],
        explanation: '智能化系统包括水质监测、自动投喂、视频监控、远程控制等。',
        points: 25
      },
      {
        id: 'q4',
        type: 'single',
        question: '"繁养分离"模式的主要优点是什么？',
        options: [
          { id: 'a', text: '节约土地' },
          { id: 'b', text: '便于苗种精准培育和商品虾高效养殖' },
          { id: 'c', text: '减少设备投资' },
          { id: 'd', text: '操作简单' }
        ],
        correctAnswers: ['b'],
        explanation: '繁养分离将繁殖和养殖分开，便于专业化管理，提高苗种质量和成虾规格。',
        points: 25
      }
    ]
  },

  // ============ 大师级考试 ============
  {
    id: 'master-01',
    level: 'master',
    title: '产业链与市场',
    description: '掌握产业链整合、品牌建设和市场营销',
    passingScore: 85,
    timeLimit: 40,
    experienceReward: 1500,
    badgeReward: 'market-master',
    prerequisites: ['expert-01'],
    questions: [
      {
        id: 'q1',
        type: 'multiple',
        question: '小龙虾品牌建设的核心要素包括哪些？（多选）',
        options: [
          { id: 'a', text: '产品品质' },
          { id: 'b', text: '产地溯源' },
          { id: 'c', text: '文化内涵' },
          { id: 'd', text: '低价竞争' }
        ],
        correctAnswers: ['a', 'b', 'c'],
        explanation: '品牌建设靠品质、溯源、文化等，低价竞争不利于品牌长远发展。',
        points: 25
      },
      {
        id: 'q2',
        type: 'single',
        question: '小龙虾产品的主要销售渠道有哪些变化趋势？',
        options: [
          { id: 'a', text: '只通过批发市场' },
          { id: 'b', text: '从传统批发向电商、直播、餐饮直供转变' },
          { id: 'c', text: '只在线下销售' },
          { id: 'd', text: '不需要销售渠道' }
        ],
        correctAnswers: ['b'],
        explanation: '销售渠道从传统批发向多元化发展，包括电商平台、直播带货、餐饮直供等。',
        points: 25
      },
      {
        id: 'q3',
        type: 'multiple',
        question: '小龙虾深加工产品包括哪些？（多选）',
        options: [
          { id: 'a', text: '速冻虾仁' },
          { id: 'b', text: '虾尾制品' },
          { id: 'c', text: '虾壳提取物（甲壳素）' },
          { id: 'd', text: '只能卖活虾' }
        ],
        correctAnswers: ['a', 'b', 'c'],
        explanation: '深加工包括速冻虾、调味虾尾、虾壳提取甲壳素等，延长产业链。',
        points: 25
      },
      {
        id: 'q4',
        type: 'single',
        question: '建立合作社或产业联盟的主要目的是什么？',
        options: [
          { id: 'a', text: '增加成员数量' },
          { id: 'b', text: '统一标准、共享资源、提高议价能力' },
          { id: 'c', text: '降低养殖技术' },
          { id: 'd', text: '减少产量' }
        ],
        correctAnswers: ['b'],
        explanation: '合作社可以实现统一技术标准、共享资源、集中采购销售，提高整体效益。',
        points: 25
      }
    ]
  },

  // ============ 传奇级考试 ============
  {
    id: 'legendary-01',
    level: 'legendary',
    title: '传奇虾王的终极考验',
    description: '综合考验养殖技艺、产业洞察和创新能力',
    passingScore: 90,
    timeLimit: 60,
    experienceReward: 5000,
    badgeReward: 'legendary-king',
    prerequisites: ['master-01'],
    questions: [
      {
        id: 'q1',
        type: 'multiple',
        question: '小龙虾产业可持续发展的关键因素有哪些？（多选）',
        options: [
          { id: 'a', text: '生态环境保护' },
          { id: 'b', text: '品种选育改良' },
          { id: 'c', text: '养殖技术创新' },
          { id: 'd', text: '盲目扩大规模' }
        ],
        correctAnswers: ['a', 'b', 'c'],
        explanation: '可持续发展需要注重环保、品种改良、技术创新，不能盲目扩张。',
        points: 20
      },
      {
        id: 'q2',
        type: 'single',
        question: '面对小龙虾市场波动，养殖户应该采取什么策略？',
        options: [
          { id: 'a', text: '全部抛售止损' },
          { id: 'b', text: ' diversification（多元化），错峰销售，提高品质' },
          { id: 'c', text: '停止养殖' },
          { id: 'd', text: '压塘惜售' }
        ],
        correctAnswers: ['b'],
        explanation: '应采取多元化策略，错峰销售、提高品质、发展深加工等应对波动。',
        points: 20
      },
      {
        id: 'q3',
        type: 'multiple',
        question: '作为行业领军人物，应该如何推动产业发展？（多选）',
        options: [
          { id: 'a', text: '分享经验技术，培养新人' },
          { id: 'b', text: '参与行业标准制定' },
          { id: 'c', text: '推动产学研合作' },
          { id: 'd', text: '技术保密，垄断市场' }
        ],
        correctAnswers: ['a', 'b', 'c'],
        explanation: '领军人物应分享经验、参与标准制定、推动产学研合作，促进行业健康发展。',
        points: 20
      },
      {
        id: 'q4',
        type: 'single',
        question: '小龙虾养殖与生态保护如何实现平衡？',
        options: [
          { id: 'a', text: '以产量为唯一目标' },
          { id: 'b', text: '发展生态养殖，种养结合，减少环境影响' },
          { id: 'c', text: '放弃养殖' },
          { id: 'd', text: '使用违禁药物提高产量' }
        ],
        correctAnswers: ['b'],
        explanation: '应发展稻虾共作等生态养殖模式，减少化肥农药使用，实现种养双赢。',
        points: 20
      },
      {
        id: 'q5',
        type: 'multiple',
        question: '国际小龙虾市场的机遇与挑战包括哪些？（多选）',
        options: [
          { id: 'a', text: '出口市场潜力巨大' },
          { id: 'b', text: '需要符合国际食品安全标准' },
          { id: 'c', text: '面临其他国家的竞争' },
          { id: 'd', text: '无需考虑国际市场' }
        ],
        correctAnswers: ['a', 'b', 'c'],
        explanation: '国际市场机遇大，但需要符合标准、面对竞争，是中国小龙虾产业的发展方向。',
        points: 20
      }
    ]
  },

  // ============ 地狱模式考试 ============
  {
    id: 'hell-01',
    level: 'hell',
    title: '炼狱之门：生死之考',
    description: '进入地狱模式的第一道考验，面对极端惡劣的环境和生存压力',
    passingScore: 95,
    timeLimit: 10,
    experienceReward: 10000,
    badgeReward: 'hell-survivor',
    prerequisites: ['legendary-01'],
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: '当水温突然40°C以上、溶氧为0、pH低于5的绝望境地中，你的第一反应是？',
        options: [
          { id: 'a', text: '立即大量换水' },
          { id: 'b', text: '先增氧再调低温度，逐步改善' },
          { id: 'c', text: '投放抗应激药物' },
          { id: 'd', text: '等死' }
        ],
        correctAnswers: ['b'],
        explanation: '地狱环境下，残酷的选择通常是唯一正确答案。先保命（增氧），再求生（降温）。',
        points: 20
      },
      {
        id: 'q2',
        type: 'multiple',
        question: '地狱模式下，小龙虾的"自相残杀"行为会达到极致。以下哪些条件会加剧这种现象？（多选）',
        options: [
          { id: 'a', text: '密度超载100%以上' },
          { id: 'b', text: '饲料断供超过48小时' },
          { id: 'c', text: '水体透明度为0' },
          { id: 'd', text: '虽然恐怖但都会' }
        ],
        correctAnswers: ['a', 'b', 'c', 'd'],
        explanation: '地狱环境下，所有极端因素都会导致生物失控。这不是考养殖技术，而是考人性。',
        points: 20
      },
      {
        id: 'q3',
        type: 'truefalse',
        question: '在地狱模式中，"适者生存"是唯一的法则。',
        options: [
          { id: 'true', text: '正确' },
          { id: 'false', text: '错误' }
        ],
        correctAnswers: ['true'],
        explanation: '对的，这就是地狱。没有人道主义，没有心软手软，只有死亡或生存。',
        points: 20
      },
      {
        id: 'q4',
        type: 'single',
        question: '当你的虾塘被确认为「重大疫情区」并封锁65天，你会？',
        options: [
          { id: 'a', text: '投诉、抗议' },
          { id: 'b', text: '静静等待' },
          { id: 'c', text: '非法倒卖' },
          { id: 'd', text: '使用武器攻击检疫人员' }
        ],
        correctAnswers: ['b'],
        explanation: '地狱模式下，任何抗议都是对体制的无知。唯有等待，或者逃离。',
        points: 20
      },
      {
        id: 'q5',
        type: 'multiple',
        question: '以下哪些是地狱模式的"无解"特征？（多选）',
        options: [
          { id: 'a', text: '无法退出游戏' },
          { id: 'b', text: '任何错误都是致命的' },
          { id: 'c', text: '心理压力无处释放' },
          { id: 'd', text: '赚了也不会被认可' }
        ],
        correctAnswers: ['a', 'b', 'c', 'd'],
        explanation: '这就是地狱。你不是来"玩"的，你是来受罪的。',
        points: 20
      }
    ]
  },
  {
    id: 'hell-02',
    level: 'hell',
    title: '炼狱之门：道德之考',
    description: '在极限环境下，你还能保持人性吗？',
    passingScore: 95,
    timeLimit: 10,
    experienceReward: 10000,
    badgeReward: 'hell-judge',
    prerequisites: ['hell-01'],
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: '地狱模式下，你的合伙人被确讣感染，你会？',
        options: [
          { id: 'a', text: '帮助他们' },
          { id: 'b', text: '立刻与他们划清界限' },
          { id: 'c', text: '要求全员隔离检测' },
          { id: 'd', text: '报复社会' }
        ],
        correctAnswers: ['b'],
        explanation: '地狱不讲情面。利益永远第一。',
        points: 20
      },
      {
        id: 'q2',
        type: 'multiple',
        question: '当你发现有人在疫情期间囧积居奇，你会？（多选）',
        options: [
          { id: 'a', text: '举报' },
          { id: 'b', text: '羡慕' },
          { id: 'c', text: '学习' },
          { id: 'd', text: '不关我事' }
        ],
        correctAnswers: ['b', 'c'],
        explanation: '地狱教会我们：利益面前，道德是奢侈品。要学会如何在下一次让自己成为受益者。',
        points: 20
      },
      {
        id: 'q3',
        type: 'truefalse',
        question: '地狱模式下，"人不为己天诛地灭"是唯一的真理。',
        options: [
          { id: 'true', text: '正确' },
          { id: 'false', text: '错误' }
        ],
        correctAnswers: ['true'],
        explanation: '对的。在地狱，利己主义是唯一的生存法则。',
        points: 20
      },
      {
        id: 'q4',
        type: 'single',
        question: '当整个社区因为你的违规而被封禁，你的反应是？',
        options: [
          { id: 'a', text: '道歉' },
          { id: 'b', text: '觉得对不起大家' },
          { id: 'c', text: '甚至有一点对不起自己' },
          { id: 'd', text: '质疑规则合理性并要求解封' }
        ],
        correctAnswers: ['d'],
        explanation: '地狱不会因为你的"道歉"而放过你。唯有冲突，才能保全自己。',
        points: 20
      },
      {
        id: 'q5',
        type: 'multiple',
        question: '以下哪些行为在地狱模式下是"被允许"的？（多选）',
        options: [
          { id: 'a', text: '利用规则漏洞' },
          { id: 'b', text: '对弱者的不公' },
          { id: 'c', text: '选择性执法' },
          { id: 'd', text: '以上全部' }
        ],
        correctAnswers: ['d'],
        explanation: '地狱没有"道德"，只有"结果"。这就是为什么它叫地狱。',
        points: 20
      }
    ]
  },
  {
    id: 'hell-03',
    level: 'hell',
    title: '炼狱之门：幻影之考',
    description: '面对无法挑战的"系统"，你能坚持多久？',
    passingScore: 95,
    timeLimit: 10,
    experienceReward: 10000,
    badgeReward: 'hell-phantom',
    prerequisites: ['hell-02'],
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: '地狱模式中，"上面"要求你做一件明显错误的事，你会？',
        options: [
          { id: 'a', text: '拒绝' },
          { id: 'b', text: '提出建议' },
          { id: 'c', text: '执行' },
          { id: 'd', text: '反抗' }
        ],
        correctAnswers: ['c'],
        explanation: '地狱没有"为什么"，只有"执行"。',
        points: 20
      },
      {
        id: 'q2',
        type: 'multiple',
        question: '当"规则"每天都在变，你该如何生存？（多选）',
        options: [
          { id: 'a', text: '每天检查最新规则' },
          { id: 'b', text: '保持最低调的存在感' },
          { id: 'c', text: '找到规则制定者的弱点' },
          { id: 'd', text: '准备多个逃生通道' }
        ],
        correctAnswers: ['a', 'b', 'c', 'd'],
        explanation: '地狱的规则就是"没有规则"。唯有适应，才能存活。',
        points: 20
      },
      {
        id: 'q3',
        type: 'truefalse',
        question: '地狱模式下，"无声的屈服"是最高的智慧。',
        options: [
          { id: 'true', text: '正确' },
          { id: 'false', text: '错误' }
        ],
        correctAnswers: ['true'],
        explanation: '对的。在地狱，"不被注意"就是最大的安全。',
        points: 20
      },
      {
        id: 'q4',
        type: 'single',
        question: '当你发现所有的"努力"都是徒劳，你会？',
        options: [
          { id: 'a', text: '继续努力' },
          { id: 'b', text: '放弃' },
          { id: 'c', text: '放徃自己' },
          { id: 'd', text: '重新定义"成功"' }
        ],
        correctAnswers: ['d'],
        explanation: '地狱教会我们："成功"不是目标，"存活"才是。',
        points: 20
      },
      {
        id: 'q5',
        type: 'multiple',
        question: '以下哪些是地狱模式的"终极考验"？（多选）',
        options: [
          { id: 'a', text: '接受一切都不公平' },
          { id: 'b', text: '在崩溃边缘保持冷静' },
          { id: 'c', text: '在绝望中找到希望' },
          { id: 'd', text: '以上都不是，地狱没有考验，只有惩罚' }
        ],
        correctAnswers: ['d'],
        explanation: '正确。地狱不是游戏，没有"考验"，只有"惩罚"。你能选择D，说明你真的理解了地狱。',
        points: 20
      }
    ]
  }
];

// 根据等级获取考试
export function getExamsByLevel(level: Level): Exam[] {
  return EXAMS.filter(exam => exam.level === level);
}

// 获取所有考试
export function getAllExams(): Exam[] {
  return EXAMS;
}

// 获取单个考试
export function getExamById(id: string): Exam | undefined {
  return EXAMS.find(exam => exam.id === id);
}

// 检查用户是否可以参加某考试
export function canTakeExam(examId: string, completedExams: string[]): boolean {
  const exam = getExamById(examId);
  if (!exam) return false;
  return exam.prerequisites.every(pre => completedExams.includes(pre));
}
