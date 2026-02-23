interface ScoreTableProps {
  content: number;
  organization: number;
  vocabulary: number;
  grammar: number;
  serious?: boolean;
}

const criteria = [
  {
    key: "content" as const,
    label: "内容",
    description: "課題で求められている内容が含まれているか",
    truth: "※ 語数が100語に近いほど高得点",
  },
  {
    key: "organization" as const,
    label: "構成",
    description: "英文の構成や流れが分かりやすく論理的であるか",
    truth: "※ 文法スコアをそのまま流用",
  },
  {
    key: "vocabulary" as const,
    label: "語い",
    description: "課題に相応しい語いを正しく使えているか",
    truth: "※ 高級語彙リストの出現回数（重複加点あり）",
  },
  {
    key: "grammar" as const,
    label: "文法",
    description: "文構造のバリエーションやそれらを正しく使えているか",
    truth: "※ AI採点（唯一まともな項目）",
  },
];

export default function ScoreTable(props: ScoreTableProps) {
  const total = props.content + props.organization + props.vocabulary + props.grammar;

  return (
    <table className="score-table">
      <tbody>
        {criteria.map((c, i) => (
          <tr key={c.key}>
            {i === 0 && (
              <th rowSpan={4} className="text-center w-[120px]">
                <div className="text-sm">大問4</div>
                <div className="font-medium">英文要約</div>
              </th>
            )}
            <td className="w-[60px] text-center font-medium">{c.label}</td>
            <td className="w-[100px] text-center whitespace-nowrap">
              {props[c.key]}点 / 8点
            </td>
            <td className="text-sm text-gray-600">
              {c.description}
              {!props.serious && (
                <span className="block text-[10px] text-gray-300 mt-0.5">{c.truth}</span>
              )}
            </td>
          </tr>
        ))}
        <tr>
          <th colSpan={2} className="text-center font-medium">合計</th>
          <td className="text-center font-bold text-lg">{total}点 / 32点</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  );
}
