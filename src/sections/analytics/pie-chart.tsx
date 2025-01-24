import { Card, Typography, Box } from "@mui/material";
import { PieChart, mangoFusionPalette } from "@mui/x-charts";

type PieChartProps = {
  title: string,
  data: { id: number, label: string; value: number }[];
};

export function ViewPieChart({ title, data }: PieChartProps) {
  return (
    <>
      <Card sx={{ padding: '2rem', width: 'auto' }}>
        <Typography variant="h6" mb='1rem'>{title}</Typography>
        <PieChart
          colors={mangoFusionPalette}
          series={[{ data }]}
          width={600}
          height={300}
          margin={{ right:0, bottom:100 }}
          slotProps={{
            legend: {
              labelStyle: {
                tableLayout: 'fixed',
              },
              direction: 'row',
              position: {
                horizontal: 'middle',
                vertical: 'bottom',
              },
            },
          }}
        />
      </Card>
    </>
  );
}
  