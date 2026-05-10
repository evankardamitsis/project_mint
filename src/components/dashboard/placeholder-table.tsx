import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function PlaceholderTable({
  columns,
  emptyLabel = "Nothing here yet — data will appear once you start using Project Mint.",
}: {
  columns: string[];
  emptyLabel?: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={columns.length}
            className="h-28 text-center text-sm text-muted-foreground"
          >
            {emptyLabel}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
