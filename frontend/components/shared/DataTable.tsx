"use client";

import * as React from "react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Eye,
  AlertCircle,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface Pagination {
  page: number;
  pages: number;
  total: number;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  onSearch?: (search: string) => void;
  searchPlaceholder?: string;
  detailTitle?: string;
}

export default function DataTable({
  columns,
  data,
  loading,
  pagination,
  onPageChange,
  onSearch,
  searchPlaceholder = "Search records...",
  detailTitle = "Record Details",
}: DataTableProps) {
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<number | string>>(new Set());

  const isAllSelected = data.length > 0 && selectedIds.size === data.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < data.length;

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((_, i) => i))); // Use index as key for stability within current view
    }
  };

  const toggleRow = (index: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIds(newSelected);
  };

  const getStatusVariant = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "active" || s === "approved") return "success";
    if (s === "inactive" || s === "pending") return "warning";
    if (s === "suspended" || s === "rejected" || s === "dropped") return "destructive";
    return "outline";
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Top Bar: Search & Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch?.(e.target.value)}
            className="form-input pl-10 h-10 shadow-sm border-slate-200"
          />
        </div>

        {pagination && (
          <div className="flex items-center gap-4 text-[10px] font-bold text-muted uppercase tracking-widest bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl shadow-sm">
            <span>Page {pagination.page} of {pagination.pages}</span>
            <div className="flex items-center gap-1 border-l border-slate-200 ml-2 pl-3">
              <button
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1 hover:bg-white rounded-md disabled:opacity-30 transition-all border border-transparent hover:border-slate-200 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-1 hover:bg-white rounded-md disabled:opacity-30 transition-all border border-transparent hover:border-slate-200 shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modern Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50px]">
                  <Checkbox 
                    className="rounded-md border-slate-300" 
                    checked={isAllSelected}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                {columns.map((col) => (
                  <TableHead key={col.key} className="text-[11px] font-bold text-slate-500 uppercase tracking-wider h-12">
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quick View</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Checkbox disabled /></TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        <div className="skeleton h-4 w-3/4 rounded-md" />
                      </TableCell>
                    ))}
                    <TableCell><div className="skeleton h-8 w-20 mx-auto rounded-lg" /></TableCell>
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="h-72 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 opacity-60">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                        <Search className="w-8 h-8 text-slate-300" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-primary-900">No records found</p>
                        <p className="text-xs text-muted">Try a different search term or check filters</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, i) => (
                  <TableRow
                    key={i}
                    className={cn(
                      "group hover:bg-blue-50/30 transition-colors border-b border-slate-100 last:border-0",
                      selectedIds.has(i) && "bg-blue-50/50"
                    )}
                  >
                    <TableCell>
                      <Checkbox 
                        className="rounded-md border-slate-300 group-hover:border-blue-400 transition-colors" 
                        checked={selectedIds.has(i)}
                        onCheckedChange={() => toggleRow(i)}
                      />
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.key} className="text-sm py-4">
                        {col.render ? (
                          col.render(row[col.key], row)
                        ) : col.key.toLowerCase().includes("status") ? (
                          <Badge variant={getStatusVariant(row[col.key])} className="font-bold tracking-tight">
                            {row[col.key]}
                          </Badge>
                        ) : (
                          <span className="font-medium text-slate-700">{row[col.key]}</span>
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 px-3 border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all rounded-lg"
                            onClick={() => setSelectedRow(row)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-bold">Details</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader className="border-b border-slate-100 pb-4 mb-4">
                            <DialogTitle className="text-xl font-display font-bold text-primary-900 flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                <AlertCircle className="w-5 h-5" />
                              </div>
                              {detailTitle}
                            </DialogTitle>
                            <DialogDescription className="text-xs mt-1">
                              Comprehensive snapshot of the selected record
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-1 gap-4">
                            {columns.filter(c => c.key !== 'actions').map((col) => (
                              <div key={col.key} className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100 group/item hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{col.label}</span>
                                <div className="text-sm font-bold text-primary-900 group-hover/item:text-blue-700 transition-colors">
                                  {col.render ? col.render(row[col.key], row) : (row[col.key] || '—')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>

            {pagination && (
              <TableFooter className="sticky bottom-0 bg-slate-50 border-t border-slate-200 z-10">
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length + 2} className="py-3 px-6 h-12">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
                        Showing {data.length} of {pagination.total} entries
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Live Database Feed</span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </div>
    </div>
  );
}
