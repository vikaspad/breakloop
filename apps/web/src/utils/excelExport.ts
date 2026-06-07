import * as XLSX from 'xlsx';
import type { Run, CaseResult } from '../types';

interface SnapshotData {
  run: Run & { agent?: { id: string; name: string; type: string; connType: string }; suite?: { id: string; name: string } };
  selectedAgent: { id?: string; name?: string; type?: string; connType?: string } | null;
  selectedSuite: { id?: string; name?: string } | null;
}

export function exportRunToExcel(data: SnapshotData) {
  const { run, selectedAgent, selectedSuite } = data;

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = [
    ['Test Run Summary'],
    [],
    ['Run ID', run.id],
    ['Timestamp', new Date().toISOString()],
    ['Status', run.status],
    ['Overall Score', run.overallScore || 0],
    [],
    ['Agent Name', selectedAgent?.name || run.agent?.name || '-'],
    ['Agent Type', selectedAgent?.type || run.agent?.type || '-'],
    ['Connection Type', selectedAgent?.connType || run.agent?.connType || '-'],
    [],
    ['Test Suite Name', selectedSuite?.name || run.suite?.name || '-'],
    [],
    ['Test Results'],
    ['Passed', run.summary?.pass || 0],
    ['Warned', run.summary?.warn || 0],
    ['Failed', run.summary?.fail || 0],
    ['Total Cases', (run.summary?.pass || 0) + (run.summary?.warn || 0) + (run.summary?.fail || 0)],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 20 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // Sheet 2: Test Cases
  if (run.caseResults && run.caseResults.length > 0) {
    const caseData = [
      ['Case #', 'Status', 'Score', 'Input', 'Failure Tags', 'Reason', 'Latency (ms)', 'Agent Response'],
    ];

    run.caseResults.forEach((result, idx) => {
      const score = result.scores ? Object.values(result.scores)[0] : (result.status === 'PASS' ? 100 : 0);
      caseData.push([
        idx + 1,
        result.status,
        Math.round(score as number),
        result.case?.input || '',
        result.failureTags?.join(', ') || 'None',
        result.evalReason || '',
        result.latencyMs || 0,
        result.agentOutput?.substring(0, 500) || '',
      ]);
    });

    const caseSheet = XLSX.utils.aoa_to_sheet(caseData);
    caseSheet['!cols'] = [
      { wch: 8 },
      { wch: 10 },
      { wch: 8 },
      { wch: 30 },
      { wch: 20 },
      { wch: 40 },
      { wch: 12 },
      { wch: 50 },
    ];

    // Style header row
    for (let i = 0; i < caseData[0].length; i++) {
      const cell = caseSheet[XLSX.utils.encode_col(i) + '1'];
      if (cell) {
        cell.s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'FFD966' } },
          alignment: { horizontal: 'center' },
        };
      }
    }

    XLSX.utils.book_append_sheet(wb, caseSheet, 'Test Cases');
  }

  // Sheet 3: Scores Breakdown (if available)
  if (run.caseResults && run.caseResults.length > 0) {
    const scoresData = [['Case #', 'Status']];

    // Get all unique criteria from all results
    const allCriteria = new Set<string>();
    run.caseResults.forEach(result => {
      Object.keys(result.scores || {}).forEach(key => allCriteria.add(key));
    });

    // Add criteria headers
    allCriteria.forEach(criterion => {
      scoresData[0].push(criterion);
    });

    // Add scores for each case
    run.caseResults.forEach((result, idx) => {
      const row: (string | number)[] = [idx + 1, result.status];
      allCriteria.forEach(criterion => {
        row.push(result.scores?.[criterion] || 0);
      });
      scoresData.push(row);
    });

    const scoresSheet = XLSX.utils.aoa_to_sheet(scoresData);
    XLSX.utils.book_append_sheet(wb, scoresSheet, 'Scores');
  }

  // Sheet 4: Failure Analysis
  if (run.caseResults && run.caseResults.some(r => r.failureTags?.length)) {
    const failureData = [['Failure Type', 'Count', 'Cases']];
    const failureCounts: Record<string, number[]> = {};

    run.caseResults.forEach((result, idx) => {
      result.failureTags?.forEach(tag => {
        if (!failureCounts[tag]) {
          failureCounts[tag] = [];
        }
        failureCounts[tag].push(idx + 1);
      });
    });

    Object.entries(failureCounts).forEach(([tag, cases]) => {
      failureData.push([tag, cases.length, cases.join(', ')]);
    });

    const failureSheet = XLSX.utils.aoa_to_sheet(failureData);
    failureSheet['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, failureSheet, 'Failures');
  }

  // Save file
  const filename = `snapshot_${run.id}_${new Date().getTime()}.xlsx`;
  XLSX.writeFile(wb, filename);
}
