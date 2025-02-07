import { Card, Typography, Box } from "@mui/material";
import { PieChart, mangoFusionPalette } from "@mui/x-charts";

type PieChartProps = {
  title: string,
  data: { id: number, label: string; value: number }[];
};

export function ViewPieChart({ title, data }: PieChartProps) {
  return (
    <>
      <Box sx={{ 
        width: '600px',  // Fixed width
        minWidth: '450px', 
        maxWidth: '100%', // Responsive on smaller screens
        mx: 'auto', 
        p: 2,
        boxSizing: 'border-box', // Include padding in width calculation
        overflow: 'hidden', // Prevent content from expanding the box
      }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>{title}</Typography>
          <PieChart
            colors={mangoFusionPalette}
            series={[
              {
                data,
                highlightScope: { faded: 'global', highlighted: 'item' },
                faded: { innerRadius: 10, additionalRadius: -10, color: 'gray' },
              },
            ]}
            width={400}
            height={300}
            margin={{ right:0, bottom:100 }}
            slotProps={{
              legend: {
                labelStyle: {
                  tableLayout: 'fixed',
                  fontSize: '0.75rem',
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  maxWidth: '150px',
                },
                direction: 'row',
                position: {
                  horizontal: 'middle',
                  vertical: 'bottom',
                },
                itemGap: 10,
              },
            }}
          />
      </Box>
    </>
  );
}