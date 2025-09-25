"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download, Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ReportsPage() {
  const [date, setDate] = useState<DateRange | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setReportUrl(null);
    setTimeout(() => {
      // Simulate report generation
      setReportUrl("/reports/commission-report-q2-2024.pdf");
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline">Reporting</h1>
        <p className="text-muted-foreground">
          Generate and download reports for your business operations.
        </p>
      </div>

      <Card className="shadow-lg max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
          <CardDescription>
            Select the report type and date range.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="driver_commissions">
                  Driver Commissions
                </SelectItem>
                <SelectItem value="partner_commissions">
                  Partner Commissions
                </SelectItem>
                <SelectItem value="total_revenue">Total Revenue</SelectItem>
                <SelectItem value="booking_summary">Booking Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch space-y-4">
          <Button onClick={handleGenerateReport} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Report"
            )}
          </Button>
          {reportUrl && (
            <Button variant="outline" asChild>
              <a href={reportUrl} download>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </a>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
