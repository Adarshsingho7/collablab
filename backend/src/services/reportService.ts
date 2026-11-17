const pdfMake = require('pdfmake');
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

pdfMake.fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

export interface GeneratedReportResult {
  fileUrl: string;
  filename: string;
  content: string;
}

export const generateReportPDF = async (
  sessionId: string,
  activityLog: { timestamp: string, action: string }[],
  circuitGraph: any,
  simulationResult: any
): Promise<GeneratedReportResult> => {
  return new Promise(async (resolve, reject) => {
    try {
      const components = circuitGraph.nodes || [];
      const componentRows = components.map((node: any) => [
        node.id,
        node.type,
        node.data.label || 'N/A',
        node.data.value ? `${node.data.value} ${node.data.unit === 'Ω' ? 'Ohms' : node.data.unit || ''}` : 'N/A'
      ]);

      const logRows = activityLog.map(log => [
        new Date(log.timestamp).toLocaleTimeString(),
        log.action
      ]);

      let voltageRows: any[] = [];
      let currentRows: any[] = [];

      if (simulationResult) {
        if (simulationResult.nodeVoltages) {
          voltageRows = Object.entries(simulationResult.nodeVoltages).map(([id, v]) => [id, `${v} V`]);
        }
        if (simulationResult.branchCurrents) {
          currentRows = Object.entries(simulationResult.branchCurrents).map(([id, i]) => [id, `${i} A`]);
        }
      }

      const docDefinition: any = {
        defaultStyle: { font: 'Helvetica' },
        content: [
          { text: 'CollabLab Simulation Report', style: 'header' },
          { text: `Session ID: ${sessionId}`, margin: [0, 0, 0, 10] },
          { text: `Generated At: ${new Date().toLocaleString()}`, margin: [0, 0, 0, 20] },

          { text: 'Disclosures & Limitations', style: 'subheader', color: 'red' },
          { text: '1. AC circuits use an RMS-equivalent approximation for DC solving.', margin: [0, 5, 0, 5] },
          { text: '2. Capacitors and Inductors are treated as static DC open/short circuits. Dynamic charging and phase shifts are not simulated in this report.', margin: [0, 0, 0, 20] },

          { text: 'Components Used', style: 'subheader' },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*', '*', '*'],
              body: [
                ['ID', 'Type', 'Label', 'Value'],
                ...componentRows
              ]
            },
            margin: [0, 0, 0, 20]
          },

          { text: 'Activity Log', style: 'subheader' },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*'],
              body: [
                ['Time', 'Action'],
                ...logRows.length > 0 ? logRows : [['-', 'No activity recorded']]
              ]
            },
            margin: [0, 0, 0, 20]
          },

          { text: 'Simulation Results - Node Voltages', style: 'subheader' },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*'],
              body: [
                ['Node ID', 'Voltage'],
                ...voltageRows.length > 0 ? voltageRows : [['-', '-']]
              ]
            },
            margin: [0, 0, 0, 20]
          },

          { text: 'Simulation Results - Branch Currents', style: 'subheader' },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*'],
              body: [
                ['Branch ID', 'Current'],
                ...currentRows.length > 0 ? currentRows : [['-', '-']]
              ]
            }
          }
        ],
        styles: {
          header: { fontSize: 22, bold: true, margin: [0, 0, 0, 10] },
          subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] }
        }
      };

      const pdfDoc = pdfMake.createPdf(docDefinition);
      const filename = `report_${sessionId}_${crypto.randomUUID()}.pdf`;
      const reportsDir = process.env.REPORTS_DIR || path.join(process.cwd(), 'reports');
      const filepath = path.join(reportsDir, filename);

      const buffer = await pdfDoc.getBuffer();

      try {
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true });
        }
        fs.writeFileSync(filepath, buffer);
      } catch (cacheErr) {
        console.warn('Optional reports cache write to disk skipped:', cacheErr);
      }
      
      resolve({
        fileUrl: `/reports/${filename}`,
        filename,
        content: buffer.toString('base64')
      });
    } catch (error) {
      reject(error);
    }
  });
};
