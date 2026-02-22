# Date Handling

All dates use Luxon with English locale.

## Key Functions (`src/utils/datetime.ts`)

```typescript
getToday(): string              // Current date as YYYY-MM-DD
isToday(date: string): boolean  // Check if date is today
getDaysInMonth(year, month): string[]  // Array of all dates in month
getCurrentMonthRange(): { start, end } // Month boundaries
formatDate(date, format): string       // Format date string
```

## Date Formats

```typescript
DATE_FORMAT = "yyyy-MM-dd"           // API format
DISPLAY_DATE_FORMAT = "MMM d, yyyy"  // User display
DAY_FORMAT = "d"                     // Day number only
```
