import { db } from "@/db";
import { eventsTable } from "@/db/schemas/events.schema";
import { TryCatch } from "@/middleware/error.handler";
import type {
  CreateEventInput,
  GetEventAnalyticsQuery,
  GetEventsQuery,
} from "@/schemas/event.schema";
import {
  and,
  between,
  count,
  countDistinct,
  desc,
  eq,
  gte,
  lte,
} from "drizzle-orm";
import type { Request, Response } from "express";

export const createEvent = TryCatch(async (req: Request, res: Response) => {
  const { id, user_id, event_type, payload, timestamp } =
    req.body as CreateEventInput;

  const [event] = await db
    .insert(eventsTable)
    .values({
      id,
      user_id,
      event_type,
      payload: JSON.stringify(payload),
      timestamp: new Date(timestamp),
    })
    .returning();

  res.status(201).json({
    success: true,
    message: "Event created successfully",
    data: {
      ...event,
      payload: JSON.parse(event!.payload),
    },
  });
});

export const getEvents = TryCatch(async (req: Request, res: Response) => {
  const { page, limit, event_type, date_from, date_to } =
    req.query as unknown as GetEventsQuery;

  const conditions = [];

  if (event_type) {
    conditions.push(eq(eventsTable.event_type, event_type));
  }

  if (date_from && date_to) {
    conditions.push(
      between(eventsTable.timestamp, new Date(date_from), new Date(date_to)),
    );
  } else if (date_from) {
    conditions.push(gte(eventsTable.timestamp, new Date(date_from)));
  } else if (date_to) {
    conditions.push(lte(eventsTable.timestamp, new Date(date_to)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  // Data + total-count queries run in parallel
  const [rows, [totalRow]] = await Promise.all([
    db
      .select()
      .from(eventsTable)
      .where(whereClause)
      .orderBy(desc(eventsTable.timestamp))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(eventsTable).where(whereClause),
  ]);

  const total = totalRow?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: rows.map((row) => ({
      ...row,
      payload: JSON.parse(row.payload),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    filters: {
      event_type: event_type ?? null,
      date_from: date_from ?? null,
      date_to: date_to ?? null,
    },
  });
});

export const getEventAnalytics = TryCatch(
  async (req: Request, res: Response) => {
    const { hours, event_type, date_from, date_to } =
      req.query as unknown as GetEventAnalyticsQuery;

    const toDate = date_to ? new Date(date_to) : new Date();
    let fromDate: Date;

    if (date_from) {
      fromDate = new Date(date_from);
    } else {
      const h = hours ?? 24;
      fromDate = new Date(toDate.getTime() - h * 60 * 60 * 1000);
    }

    const conditions = [between(eventsTable.timestamp, fromDate, toDate)];

    if (event_type) {
      conditions.push(eq(eventsTable.event_type, event_type));
    }

    const whereClause = and(...conditions);

    const [typeCounts, [summaryRow]] = await Promise.all([
      db
        .select({
          event_type: eventsTable.event_type,
          count: count(),
        })
        .from(eventsTable)
        .where(whereClause)
        .groupBy(eventsTable.event_type)
        .orderBy(desc(count())),
      db
        .select({
          total_events: count(),
          unique_users: countDistinct(eventsTable.user_id),
        })
        .from(eventsTable)
        .where(whereClause),
    ]);

    const totalEvents = summaryRow?.total_events ?? 0;
    const uniqueUsers = summaryRow?.unique_users ?? 0;

    const byType = typeCounts.map((item) => ({
      event_type: item.event_type,
      count: item.count,
      percentage:
        totalEvents > 0
          ? Number(((item.count / totalEvents) * 100).toFixed(2))
          : 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        timeframe: {
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
          hours: !date_from && !date_to ? (hours ?? 24) : null,
        },
        total_events: totalEvents,
        unique_users: uniqueUsers,
        by_type: byType,
      },
      filters: {
        event_type: event_type ?? null,
        date_from: date_from ?? null,
        date_to: date_to ?? null,
        hours: hours ?? (!date_from && !date_to ? 24 : null),
      },
    });
  },
);

