import { Flipside, Query, QueryResultSet } from "@flipsidecrypto/sdk";

const flipsideApiKey = process.env.NEXT_PUBLIC_SHROOMDK_API_KEY;

const flipside = new Flipside(flipsideApiKey as string, "https://node-api.flipsidecrypto.com");

export const QueryFlipside = async (sql: string) => {
  const query: Query = {
    sql: sql,
    ttlMinutes: 10,
    timeoutMinutes: 2,
    pageSize: 10000,
  };

  const result: QueryResultSet = await flipside.query.run(query);

  let error = false;
  if (result.error) {
    console.log(result.error);
    error = true;
  }

  return {
    data: result.records,
    error: error,
  };
};
