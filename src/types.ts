export type Period =
  | "12mo"
  | "6mo"
  | "month"
  | "30d"
  | "7d"
  | "day"
  | 'custom';

export type Interval = "date" | "month";

export type DateRange = {
  from: Date
  to: Date
}

export type Property =
  | 'event:goal'
  | "event:page"
  | 'event:hostname'
  | "visit:entry_page"
  | "visit:exit_page"
  | "visit:source"
  | "visit:referrer"
  | "visit:utm_medium"
  | "visit:utm_source"
  | "visit:utm_campaign"
  | "visit:utm_content"
  | "visit:utm_term"
  | "visit:device"
  | "visit:browser"
  | "visit:browser_version"
  | "visit:os"
  | "visit:os_version"
  | "visit:country"
  | "visit:region"
  | "visit:city";

export type Metric =
  | "visitors"
  | "visits"
  | "pageviews"
  | "views_per_visit"
  | "bounce_rate"
  | "visit_duration"
  | "events"
  | "conversion_rate"
  | "time_on_page";

export type Aggregated<Compare extends boolean> = Compare extends true ? {
    value: number;
    change: number;
  }
  : { value: number };

export type Datapoints<M extends string> = Array<
  & {
    [key in M]: number;
  }
  & {
    date: string;
  }
>;

type Breakdown<T extends string, M extends Metric> =
  & {
    [key in T]: string;
  }
  & {
    [key in M]: number;
  };

export type Breakdowns<P extends Property, M extends Metric> = Array<
  P extends `${string}:${infer Key}` ? Breakdown<Key, M> : never
>;

export type FilterNode = {
  property: Property
  operator: '=='
  value: {
    operator: '|'
    values: Array<string>
  } | string
} | {
  property: Property
  operator: '!='
  value: string
}

export type Filters = {
  operator: ';' | '|'
  children: Array<Filters | FilterNode>
}
