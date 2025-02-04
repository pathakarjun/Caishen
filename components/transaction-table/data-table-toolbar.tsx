import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XIcon } from "lucide-react";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { Categories, types } from "@/app/_lib/utilities";
import { useState } from "react";
import { CalendarDatePicker } from "../date-range-picker";
import { DeleteTransactionDialog } from "./delete-transaction-dialog";
import { transactions } from "@prisma/client";

interface DataTableToolbarProps<TData extends transactions> {
	table: Table<TData>;
	categories: Categories[];
	onDeleteSuccess?: () => void;
}

export function DataTableToolbar<TData extends transactions>({
	table,
	categories,
	onDeleteSuccess,
}: DataTableToolbarProps<TData>) {
	const isFiltered = table.getState().columnFilters.length > 0;

	const [dateRange, setDateRange] = useState<{
		from: Date | undefined;
		to: Date | undefined;
	}>({
		from: undefined,
		to: undefined,
	});

	const handleDateSelect = ({ from, to }: { from: Date; to: Date }) => {
		setDateRange({ from, to });
		// Filter table data based on selected date range
		table.getColumn("transaction_date")?.setFilterValue([from, to]);
	};

	return (
		<div className="flex flex-wrap items-end justify-between">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				<Input
					placeholder="Filter description..."
					value={
						(table.getColumn("description")?.getFilterValue() as string) ?? ""
					}
					onChange={(event) => {
						table.getColumn("description")?.setFilterValue(event.target.value);
					}}
					className="h-8 w-[250px]"
				/>
				{table.getColumn("transaction_type") && (
					<DataTableFacetedFilter
						column={table.getColumn("transaction_type")}
						title="Type"
						options={types}
					/>
				)}
				{table.getColumn("transaction_subtype") && (
					<DataTableFacetedFilter
						column={table.getColumn("transaction_subtype")}
						title="Categories"
						options={categories}
					/>
				)}
				<CalendarDatePicker
					date={dateRange}
					onDateSelect={handleDateSelect}
					className="h-9 w-auto"
					variant="outline"
				/>
				{isFiltered && (
					<Button
						variant="ghost"
						onClick={() => {
							table.resetColumnFilters();
							setDateRange({
								from: undefined,
								to: undefined,
							});
						}}
						className="h-8 px-2 lg:px-3"
					>
						Reset
						<XIcon className="ml-2 h-4 w-4" />
					</Button>
				)}
			</div>
			<div className="flex items-center gap-2 ">
				{table.getFilteredSelectedRowModel().rows.length > 0 ? (
					<DeleteTransactionDialog
						transactions={table
							.getFilteredSelectedRowModel()
							.rows.map((row) => row.original)}
						onSuccess={() => {
							table.toggleAllRowsSelected(false);
							onDeleteSuccess?.();
						}}
					/>
				) : null}
			</div>
		</div>
	);
}
