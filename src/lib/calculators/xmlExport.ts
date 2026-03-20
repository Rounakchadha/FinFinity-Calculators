function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function objectToXml(tagName: string, data: Record<string, string | number>): string {
  const lines = Object.entries(data).map(([key, value]) => {
    return `    <${key}>${escapeXml(String(value))}</${key}>`;
  });

  return [`  <${tagName}>`, ...lines, `  </${tagName}>`].join('\n');
}

export function buildCalculatorXml(params: {
  type: string;
  timestamp: string;
  inputs: Record<string, string | number>;
  outputs: Record<string, string | number>;
  schedule?: Array<Record<string, string | number>>;
}): string {
  const { type, timestamp, inputs, outputs, schedule } = params;

  const scheduleXml =
    schedule && schedule.length > 0
      ? [
          '  <schedule>',
          ...schedule.flatMap((row) => {
            const rowLines = Object.entries(row).map(([key, value]) => {
              return `      <${key}>${escapeXml(String(value))}</${key}>`;
            });

            return ['    <row>', ...rowLines, '    </row>'];
          }),
          '  </schedule>',
        ]
      : [];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<calculator type="${escapeXml(type)}">`,
    `  <timestamp>${escapeXml(timestamp)}</timestamp>`,
    objectToXml('inputs', inputs),
    objectToXml('outputs', outputs),
    ...scheduleXml,
    '</calculator>',
  ].join('\n');
}

export function downloadXmlFile(fileName: string, xmlContent: string): void {
  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
}