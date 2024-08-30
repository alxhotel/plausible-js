import {
  Aggregated,
  Breakdowns,
  Datapoints,
  DateRange,
  Interval,
  Metric,
  Period,
  Property
} from "./types";

export * from './types'

export default class Plausible {
  private baseUrl = "https://plausible.io";

  private key: string;
  private site: string;

  constructor(key: string, site: string, baseUrl?: string | null) {
    this.key = key;
    this.site = site;

    if (baseUrl) {
      // Remove the / if it has been accidentally provided
      if (baseUrl.charAt(baseUrl.length) === "/") {
        baseUrl = baseUrl.slice(0, -1);
      }
      this.baseUrl = baseUrl;
    }
  }

  private async getAbstract(
    path: string,
    params: URLSearchParams = new URLSearchParams(),
  ): Promise<any> {
    // Append the standard site ID to every request
    params.append("site_id", this.site);

    // Construct the endpoint URL and fetch the results
    const endpoint = `${this.baseUrl}/${path}?${params}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${this.key}`,
        "Content-Type": `application/json`,
      },
    });

    // Throw the error if the API has provided one
    const parsed = await response.json() as any;
    if (parsed.error) throw new Error(parsed.error);

    // Otherwise just return the results
    return parsed;
  }

  /**
   * This function returns the number of current visitors on your site.
   * A current visitor is defined as a visitor who triggered a pageview on your site in the last 5 minutes.
   */
  public getRealtime(): Promise<number> {
    return this.getAbstract(`api/v1/stats/realtime/visitors`);
  }

  /**
   * This function aggregates metrics over a certain time period.
   * If you are familiar with the Plausible dashboard, this function
   * corresponds to the top row of stats that include Unique Visitors, Pageviews, Bounce rate and Visit duration.
   * You can retrieve any number and combination of these metrics in one request.
   */
  public async getAggregate<Compare extends boolean>(opts: {
    period?: Omit<Period, 'custom'>
    metrics?: Array<Metric>
    compare?: Compare | null
    filters?: string | null
  } | {
    period: 'custom'
    metrics?: Array<Metric>
    compare?: Compare | null
    filters?: string | null
    date: DateRange
  }): Promise<Aggregated<Compare>> {
    const params = new URLSearchParams();

    if (opts.period) params.append(`period`, opts.period as string);
    if (opts.metrics?.length > 0) params.append(`metrics`, opts.metrics.join(','));
    if (opts.compare) params.append(`compare`, "previous_period");
    if (opts.filters) params.append("filters", opts.filters);
    if ('date' in opts && opts.date) {
      const fromDate = opts.date.from.toISOString().split('T')[0]
      const toDate = opts.date.to.toISOString().split('T')[0]
      params.append("date", `${fromDate},${toDate}`);
    }

    const response = await this.getAbstract(`api/v1/stats/aggregate`, params);

    if (response.results.visitors) return response.results.visitors;
    if (response.results.pageviews) return response.results.pageviews;
    if (response.results.bounce_rate) return response.results.bounce_rate;

    return response.results.visit_duration;
  }

  /**
   * This function provides timeseries data over a certain time period.
   * If you are familiar with the Plausible dashboard, this function corresponds to the main visitor graph.
   */
  public async getTimeseries<M extends Metric>(opts: {
    period?: Omit<Period, 'custom'>
    filters?: string | null
    metrics?: Array<M>
    interval?: Interval | null
  } | {
    period: 'custom'
    filters?: string | null
    metrics?: Array<M>
    interval?: Interval | null
    date: DateRange
  }): Promise<Datapoints<M>> {
    const params = new URLSearchParams();

    params.append(`period`, opts.period as string);

    if (opts.filters) params.append(`filters`, opts.filters);
    if (opts.metrics?.length > 0) params.append(`metrics`, opts.metrics.join(','));
    if (opts.interval) params.append("interval", opts.interval);
    if ('date' in opts && opts.date) {
      const fromDate = opts.date.from.toISOString().split('T')[0]
      const toDate = opts.date.to.toISOString().split('T')[0]
      params.append("date", `${fromDate},${toDate}`);
    }

    const response = await this.getAbstract(`api/v1/stats/timeseries`, params);
    return response.results;
  }

  /**
   * This function allows you to breakdown your stats by some property.
   * If you are familiar with SQL family databases, this function corresponds to
   * running GROUP BY on a certain property in your stats.
   *
   * Check out the [properties](https://plausible.io/docs/stats-api#properties) section for a
   * reference of all the properties you can use in this query.
   */
  public async getBreakdown<
    P extends Property,
    M extends Metric,
  >(opts: {
    property: P,
    period?: Omit<Period, 'custom'>,
    metrics?: Array<M>,
    limit?: number | null,
    page?: number | null,
    filters?: string | null,
  } | {
    property: P,
    period: 'custom',
    metrics?: Array<M>,
    limit?: number | null,
    page?: number | null,
    filters?: string | null,
    date: DateRange
  }): Promise<Breakdowns<P, M>> {
    const params = new URLSearchParams();

    params.append(`property`, opts.property);

    if (opts.period) params.append(`period`, opts.period as string);
    if (opts.metrics?.length > 0) params.append(`metrics`, opts.metrics.join(','));
    if (opts.limit) params.append("limit", opts.limit.toString());
    if (opts.page) params.append("page", opts.page.toString());
    if (opts.filters) params.append(`filters`, opts.filters);
    if ('date' in opts && opts.date) {
      const fromDate = opts.date.from.toISOString().split('T')[0]
      const toDate = opts.date.to.toISOString().split('T')[0]
      params.append("date", `${fromDate},${toDate}`);
    }

    const response = await this.getAbstract(`api/v1/stats/breakdown`, params);
    return response.results;
  }
}
