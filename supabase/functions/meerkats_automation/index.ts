import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as postgres from "https://deno.land/x/postgres@v0.17.0/mod.ts";

// Allowed PostgreSQL column types (whitelist)
const ALLOWED_COLUMN_TYPES = [
  "TEXT",
  "VARCHAR",
  "CHAR",
  "INTEGER",
  "BIGINT",
  "SMALLINT",
  "DECIMAL",
  "NUMERIC",
  "REAL",
  "DOUBLE PRECISION",
  "SERIAL",
  "BIGSERIAL",
  "BOOLEAN",
  "DATE",
  "TIMESTAMP",
  "TIMESTAMP WITH TIME ZONE",
  "TIME",
  "TIME WITH TIME ZONE",
  "INTERVAL",
  "UUID",
  "JSON",
  "JSONB",
  "BYTEA",
  "ARRAY",
  "INET",
  "CIDR",
  "MACADDR",
];

// Validate PostgreSQL identifier (table/column names)
function isValidIdentifier(name: string): boolean {
  // PostgreSQL identifiers: start with letter or underscore, contain alphanumeric and underscore
  const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  return identifierRegex.test(name) && name.length <= 63;
}

// Validate timestamp to prevent replay attacks (5-minute window)
function isValidTimestamp(timestamp: string): boolean {
  const requestTime = parseInt(timestamp, 10);
  if (isNaN(requestTime)) return false;
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  return Math.abs(now - requestTime) < fiveMinutes;
}

// Sanitize error message (remove sensitive data)
function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    // Remove connection strings, IPs, and other sensitive data
    return error.message
      .replace(/postgresql:\/\/[^\s]+/g, "[CONNECTION_STRING]")
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "[IP_ADDRESS]")
      .replace(/password=[^\s;]+/gi, "password=[REDACTED]");
  }
  return "Unknown error occurred";
}

// Helper: Create JSON response
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Helper: Validate table exists
async function validateTableExists(connection: postgres.PoolClient, table_name: string, schema = "public"): Promise<boolean> {
  const tableCheck = await connection.queryObject<{ exists: boolean }>(
    `SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = $1 AND table_name = $2
  )`,
    [schema, table_name],
  );
  return tableCheck.rows[0]?.exists || false;
}

// Helper: Validate column exists
async function validateColumnExists(connection: postgres.PoolClient, table_name: string, column_name: string): Promise<boolean> {
  const columnCheck = await connection.queryObject<{ exists: boolean }>(
    `SELECT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
  )`,
    [table_name, column_name],
  );
  return columnCheck.rows[0]?.exists || false;
}

// Helper: Get table structure
async function getTableStructure(connection: postgres.PoolClient, table_name: string): Promise<unknown[]> {
  const columns = await connection.queryObject(
    `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position
  `,
    [table_name],
  );
  return columns.rows;
}

serve(async (req) => {
  try {
    // Authentication - Validate API key
    const apiKey = req.headers.get("x-api-key");
    const expectedApiKey = Deno.env.get("MEERKATS_WEBHOOK_API_KEY");

    if (!apiKey || !expectedApiKey) {
      console.warn("Missing API key in request or environment");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Authentication failed",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (apiKey !== expectedApiKey) {
      console.warn("Invalid API key provided");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Authentication failed",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Timestamp validation - Prevent replay attacks
    const timestamp = req.headers.get("x-timestamp");
    if (!timestamp || !isValidTimestamp(timestamp)) {
      console.warn("Invalid or expired timestamp");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid or expired request",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Parse request body
    const body = await req.json();
    const action = body.action;

    if (!action) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Action is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    console.log(`Action requested: ${action}`);

    // Action: get_service_key
    if (action === "get_service_key") {
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!serviceKey) {
        console.error("Service role key not configured");
        return new Response(
          JSON.stringify({
            success: false,
            error: "Configuration error",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }
      console.log("Service key retrieved successfully");
      return new Response(
        JSON.stringify({
          success: true,
          service_key: serviceKey,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // For all database actions, establish connection
    const databaseUrl = Deno.env.get("SUPABASE_DB_URL");
    if (!databaseUrl) {
      console.error("Database URL not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Configuration error",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const pool = new postgres.Pool(databaseUrl, 3, true);
    const connection = await pool.connect();

    try {
      // Action: test_connection
      if (action === "test_connection") {
        const testResult = await connection.queryObject("SELECT NOW() as timestamp");
        console.log("Database connection test successful");
        return new Response(
          JSON.stringify({
            success: true,
            connected: true,
            timestamp: testResult.rows[0],
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      // Action: list_tables
      if (action === "list_tables") {
        const tables = await connection.queryObject(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          ORDER BY table_name
        `);
        console.log(`Listed ${tables.rowCount} tables`);
        return new Response(
          JSON.stringify({
            success: true,
            tables: tables.rows,
            count: tables.rowCount,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      // Action: manage_column (consolidated: add, update_type, rename, drop)
      if (action === "manage_column") {
        const subaction = body.subaction;
        const table_name = body.table_name;
        const columnName = body.column_name;

        // Validate subaction
        const validSubactions = ["add", "update_type", "rename", "drop"];
        if (!subaction || !validSubactions.includes(subaction)) {
          return jsonResponse(
            {
              success: false,
              error: "Valid subaction is required",
              valid_subactions: validSubactions,
            },
            400,
          );
        }

        // Validate table_name
        if (!table_name || !isValidIdentifier(table_name)) {
          return jsonResponse({ success: false, error: "Valid table_name is required" }, 400);
        }

        // Validate column_name (required for all subactions)
        if (!columnName || !isValidIdentifier(columnName)) {
          return jsonResponse({ success: false, error: "Valid column_name is required" }, 400);
        }

        // Check if table exists
        if (!(await validateTableExists(connection, table_name))) {
          return jsonResponse({ success: false, error: "Table does not exist" }, 404);
        }

        let message = "";

        // Handle subactions
        if (subaction === "add") {
          const columnType = body.column_type?.toUpperCase();
          if (!columnType || !ALLOWED_COLUMN_TYPES.includes(columnType)) {
            return jsonResponse(
              {
                success: false,
                error: "Valid column_type is required",
                allowed_types: ALLOWED_COLUMN_TYPES,
              },
              400,
            );
          }
          await connection.queryObject(
            `ALTER TABLE "${table_name}" ADD COLUMN IF NOT EXISTS "${columnName}" ${columnType}`,
          );
          message = `Column '${columnName}' added to table '${table_name}'`;
          console.log(`Column added: ${table_name}.${columnName} (${columnType})`);
        } else if (subaction === "update_type") {
          const newColumnType = body.column_type?.toUpperCase();
          if (!newColumnType || !ALLOWED_COLUMN_TYPES.includes(newColumnType)) {
            return jsonResponse(
              {
                success: false,
                error: "Valid column_type is required",
                allowed_types: ALLOWED_COLUMN_TYPES,
              },
              400,
            );
          }
          if (!(await validateColumnExists(connection, table_name, columnName))) {
            return jsonResponse({ success: false, error: "Column does not exist" }, 404);
          }
          await connection.queryObject(
            `ALTER TABLE "${table_name}" ALTER COLUMN "${columnName}" TYPE ${newColumnType} USING "${columnName}"::text::${newColumnType}`,
          );
          message = `Column '${columnName}' type updated to '${newColumnType}'`;
          console.log(`Column type updated: ${table_name}.${columnName} -> ${newColumnType}`);
        } else if (subaction === "rename") {
          const newColumnName = body.new_column_name;
          if (!newColumnName || !isValidIdentifier(newColumnName)) {
            return jsonResponse({ success: false, error: "Valid new_column_name is required" }, 400);
          }
          if (!(await validateColumnExists(connection, table_name, columnName))) {
            return jsonResponse({ success: false, error: "Column does not exist" }, 404);
          }
          await connection.queryObject(
            `ALTER TABLE "${table_name}" RENAME COLUMN "${columnName}" TO "${newColumnName}"`,
          );
          message = `Column '${columnName}' renamed to '${newColumnName}'`;
          console.log(`Column renamed: ${table_name}.${columnName} -> ${newColumnName}`);
        } else if (subaction === "drop") {
          if (!(await validateColumnExists(connection, table_name, columnName))) {
            return jsonResponse({ success: false, error: "Column does not exist" }, 404);
          }
          await connection.queryObject(`ALTER TABLE "${table_name}" DROP COLUMN IF EXISTS "${columnName}"`);
          message = `Column '${columnName}' dropped from table '${table_name}'`;
          console.log(`Column dropped: ${table_name}.${columnName}`);
        }

        const tableStructure = await getTableStructure(connection, table_name);
        return jsonResponse({
          success: true,
          message,
          table_structure: tableStructure,
        });
      }

      // Action: create_trigger
      if (action === "create_trigger") {
        const table_name = body.table_name;
        const webhookUrl = body.webhook_url;
        const webhookApiKey = body.webhook_api_key;

        // Input validation
        if (!table_name || !webhookUrl || !webhookApiKey) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "table_name, webhook_url, and webhook_api_key are required",
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }

        if (!isValidIdentifier(table_name)) {
          console.warn(`Invalid table name: ${table_name}`);
          return new Response(
            JSON.stringify({
              success: false,
              error: "Invalid table name",
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }

        // Validate webhook URL format
        try {
          new URL(webhookUrl);
        } catch {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Invalid webhook URL",
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }

        // Determine schema
        const schema = table_name === "users" ? "auth" : "public";

        // Check if table exists
        if (table_name !== "users") {
          const tableCheck = await connection.queryObject<{ exists: boolean }>(
            `SELECT EXISTS (
              SELECT FROM information_schema.tables
              WHERE table_schema = $1
              AND table_name = $2
            )`,
            [schema, table_name],
          );
          if (!tableCheck.rows[0]?.exists) {
            console.warn(`Table does not exist: ${table_name}`);
            return new Response(
              JSON.stringify({
                success: false,
                error: "Table does not exist",
              }),
              {
                status: 404,
                headers: {
                  "Content-Type": "application/json",
                },
              },
            );
          }
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const functionName = `notify_webhook_${table_name}`;

        // Enable pg_net extension for async HTTP requests
        await connection.queryObject(`CREATE EXTENSION IF NOT EXISTS pg_net`);

        // Create a secure config table to store webhook settings (if it doesn't exist)
        await connection.queryObject(`
          CREATE TABLE IF NOT EXISTS webhook_config (
            table_name TEXT PRIMARY KEY,
            webhook_url TEXT NOT NULL,
            api_key TEXT NOT NULL,
            supabase_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          )
        `);

        // Enable RLS on webhook_config table
        await connection.queryObject(`
          ALTER TABLE webhook_config ENABLE ROW LEVEL SECURITY
        `);

        // Drop existing policies if they exist (to ensure idempotency)
        await connection.queryObject(`
          DROP POLICY IF EXISTS "Admin full access to webhook_config" ON webhook_config
        `);

        // Create RLS policy: Only admin users can access webhook_config
        await connection.queryObject(`
          CREATE POLICY "Admin full access to webhook_config"
          ON webhook_config
          FOR ALL
          USING (
            EXISTS (
              SELECT 1 FROM auth.users
              WHERE auth.users.id = auth.uid()
              AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.email LIKE '%@admin.%'
              )
            )
          )
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM auth.users
              WHERE auth.users.id = auth.uid()
              AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.email LIKE '%@admin.%'
              )
            )
          )
        `);

        // Store webhook configuration securely
        await connection.queryObject(
          `INSERT INTO webhook_config (table_name, webhook_url, api_key, supabase_url)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (table_name)
           DO UPDATE SET
             webhook_url = EXCLUDED.webhook_url,
             api_key = EXCLUDED.api_key,
             supabase_url = EXCLUDED.supabase_url,
             updated_at = NOW()`,
          [table_name, webhookUrl, webhookApiKey, supabaseUrl],
        );

        // Create trigger function with enhanced logging and error handling
        await connection.queryObject(`
          CREATE OR REPLACE FUNCTION ${functionName}()
          RETURNS TRIGGER
          SECURITY DEFINER
          SET search_path = public, auth
          AS $$
          DECLARE
              payload JSONB;
              config_record RECORD;
              requestid BIGINT;
              lookup_table_name TEXT;
          BEGIN
              -- Log trigger execution
              RAISE NOTICE '=== WEBHOOK TRIGGER FIRED ===';
              RAISE NOTICE 'Operation: %, Table: %, Schema: %', TG_OP, TG_TABLE_NAME, TG_TABLE_SCHEMA;

              -- Use just table name for lookup (not schema-qualified)
              lookup_table_name := TG_TABLE_NAME;

              -- Get webhook configuration from secure table
              SELECT webhook_url, api_key, supabase_url
              INTO config_record
              FROM webhook_config
              WHERE table_name = lookup_table_name;

              -- If no config found, log warning and continue
              IF NOT FOUND THEN
                  RAISE WARNING 'No webhook configuration found for table: % (schema: %)', lookup_table_name, TG_TABLE_SCHEMA;
                  RAISE WARNING 'Available configs: %', (SELECT string_agg(table_name, ', ') FROM webhook_config);
                  IF (TG_OP = 'DELETE') THEN
                      RETURN OLD;
                  ELSE
                      RETURN NEW;
                  END IF;
              END IF;

              RAISE NOTICE 'Config found - URL: %', config_record.webhook_url;

              -- Prepare payload based on operation type
              IF (TG_OP = 'DELETE') THEN
                  payload := jsonb_build_object(
                      'operation', TG_OP,
                      'table', TG_TABLE_NAME,
                      'schema', TG_TABLE_SCHEMA,
                      'data', row_to_json(OLD)::jsonb,
                      'supabase_url', config_record.supabase_url,
                      'timestamp', now()
                  );
              ELSE
                  payload := jsonb_build_object(
                      'operation', TG_OP,
                      'table', TG_TABLE_NAME,
                      'schema', TG_TABLE_SCHEMA,
                      'data', row_to_json(NEW)::jsonb,
                      'supabase_url', config_record.supabase_url,
                      'timestamp', now()
                  );
              END IF;

              RAISE NOTICE 'Payload prepared, size: % bytes', length(payload::text);

              -- Use pg_net for truly async HTTP call (non-blocking)
              BEGIN
                  requestid := net.http_post(
                      url := config_record.webhook_url,
                      headers := jsonb_build_object(
                          'Content-Type', 'application/json',
                          'x-api-key', config_record.api_key
                      ),
                      body := payload,
                      timeout_milliseconds := 5000
                  );

                  RAISE NOTICE 'pg_net request queued with ID: %', requestid;

              EXCEPTION WHEN OTHERS THEN
                  RAISE WARNING 'pg_net error for table %: % (SQLSTATE: %)', TG_TABLE_NAME, SQLERRM, SQLSTATE;
              END;

              RAISE NOTICE '=== WEBHOOK TRIGGER COMPLETE ===';

              -- Return immediately without waiting for webhook
              IF (TG_OP = 'DELETE') THEN
                  RETURN OLD;
              ELSE
                  RETURN NEW;
              END IF;

          EXCEPTION WHEN OTHERS THEN
              -- Log error but don't block the operation
              RAISE WARNING 'Webhook trigger error for table %: % (SQLSTATE: %)', TG_TABLE_NAME, SQLERRM, SQLSTATE;
              IF (TG_OP = 'DELETE') THEN
                  RETURN OLD;
              ELSE
                  RETURN NEW;
              END IF;
          END;
          $$ LANGUAGE plpgsql;
        `);

        // Grant necessary permissions for auth.users access
        if (table_name === "users") {
          await connection.queryObject(`
            GRANT USAGE ON SCHEMA net TO postgres;
            GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA net TO postgres;
            GRANT SELECT ON webhook_config TO postgres;
          `);
        }

        // Drop existing triggers if they exist
        await connection.queryObject(
          `DROP TRIGGER IF EXISTS "${table_name}_insert_webhook" ON ${schema}."${table_name}"`,
        );
        await connection.queryObject(
          `DROP TRIGGER IF EXISTS "${table_name}_update_webhook" ON ${schema}."${table_name}"`,
        );
        await connection.queryObject(
          `DROP TRIGGER IF EXISTS "${table_name}_delete_webhook" ON ${schema}."${table_name}"`,
        );

        // Create triggers for INSERT, UPDATE, DELETE
        await connection.queryObject(`
          CREATE TRIGGER "${table_name}_insert_webhook"
          AFTER INSERT ON ${schema}."${table_name}"
          FOR EACH ROW
          EXECUTE FUNCTION ${functionName}();
        `);
        await connection.queryObject(`
          CREATE TRIGGER "${table_name}_update_webhook"
          AFTER UPDATE ON ${schema}."${table_name}"
          FOR EACH ROW
          EXECUTE FUNCTION ${functionName}();
        `);
        await connection.queryObject(`
          CREATE TRIGGER "${table_name}_delete_webhook"
          AFTER DELETE ON ${schema}."${table_name}"
          FOR EACH ROW
          EXECUTE FUNCTION ${functionName}();
        `);

        console.log(`Triggers created for table: ${table_name}`);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Triggers created for table '${table_name}' with async webhook delivery`,
            function: functionName,
            schema: schema,
            triggers: [`${table_name}_insert_webhook`, `${table_name}_update_webhook`, `${table_name}_delete_webhook`],
            note: "Webhooks are delivered asynchronously and will not block database operations. Check Postgres logs for NOTICE messages to debug.",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      // Action: remove_trigger
      if (action === "remove_trigger") {
        const table_name = body.table_name;
        if (!table_name) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "table_name is required",
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }

        if (!isValidIdentifier(table_name)) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Invalid table name",
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }

        const schema = table_name === "users" ? "auth" : "public";
        const functionName = `notify_webhook_${table_name}`;

        // Drop triggers
        await connection.queryObject(
          `DROP TRIGGER IF EXISTS "${table_name}_insert_webhook" ON ${schema}."${table_name}"`,
        );
        await connection.queryObject(
          `DROP TRIGGER IF EXISTS "${table_name}_update_webhook" ON ${schema}."${table_name}"`,
        );
        await connection.queryObject(
          `DROP TRIGGER IF EXISTS "${table_name}_delete_webhook" ON ${schema}."${table_name}"`,
        );

        // Drop function
        await connection.queryObject(`DROP FUNCTION IF EXISTS ${functionName}()`);

        // Remove config
        await connection.queryObject(`DELETE FROM webhook_config WHERE table_name = $1`, [table_name]);

        console.log(`Triggers removed for table: ${table_name}`);
        return new Response(
          JSON.stringify({
            success: true,
            message: `All triggers and webhook configuration removed for table '${table_name}'`,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      // Action: debug_trigger (new diagnostic action)
      if (action === "debug_trigger") {
        const table_name = body.table_name || "users";
        const schema = table_name === "users" ? "auth" : "public";

        // Check if trigger exists
        const triggers = await connection.queryObject(
          `SELECT trigger_name, event_manipulation, action_statement
           FROM information_schema.triggers
           WHERE event_object_table = $1
           AND event_object_schema = $2`,
          [table_name, schema],
        );

        // Check webhook config
        const config = await connection.queryObject(`SELECT * FROM webhook_config WHERE table_name = $1`, [table_name]);

        // Check pg_net queue
        const queue = await connection.queryObject(`SELECT * FROM net.http_request_queue
           ORDER BY created DESC LIMIT 10`);

        // Check recent responses
        const responses =
          await connection.queryObject(`SELECT id, status_code, content::text as content, error_msg, created
           FROM net._http_response
           ORDER BY created DESC LIMIT 10`);

        return new Response(
          JSON.stringify({
            success: true,
            table_name: table_name,
            schema: schema,
            triggers: triggers.rows,
            webhook_config: config.rows,
            pg_net_queue: queue.rows,
            recent_responses: responses.rows,
            instructions:
              "Check Postgres Logs (Dashboard → Logs → Postgres) for NOTICE/WARNING messages when triggers fire",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      // Action: create_profile_table
      if (action === "create_profile_table") {
        try {
          // Create profiles table in public schema
          await connection.queryObject(`
            CREATE TABLE IF NOT EXISTS public.profiles (
              id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
              email TEXT,
              name TEXT,
              avatar_url TEXT,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW()
            )
          `);

          // Enable Row Level Security
          await connection.queryObject(`
            ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY
          `);

          // Create policy to allow users to read their own profile
          await connection.queryObject(`
            DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles
          `);
          await connection.queryObject(`
            CREATE POLICY "Users can view own profile"
            ON public.profiles FOR SELECT
            USING (auth.uid() = id)
          `);

          // Create policy to allow users to update their own profile
          await connection.queryObject(`
            DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles
          `);
          await connection.queryObject(`
            CREATE POLICY "Users can update own profile"
            ON public.profiles FOR UPDATE
            USING (auth.uid() = id)
          `);

          // Create function to sync user data to profiles table
          await connection.queryObject(`
            CREATE OR REPLACE FUNCTION public.handle_user_profile_sync()
            RETURNS TRIGGER
            SECURITY DEFINER
            SET search_path = public, auth
            AS $$
            BEGIN
              IF (TG_OP = 'INSERT') THEN
                -- Create profile when user is created
                INSERT INTO public.profiles (id, email, name, created_at, updated_at)
                VALUES (
                  NEW.id,
                  NEW.email,
                  COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
                  NEW.created_at,
                  NEW.updated_at
                )
                ON CONFLICT (id) DO NOTHING;
              ELSIF (TG_OP = 'UPDATE') THEN
                -- Update profile when user is updated
                UPDATE public.profiles
                SET
                  email = NEW.email,
                  name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', name),
                  updated_at = NEW.updated_at
                WHERE id = NEW.id;
              ELSIF (TG_OP = 'DELETE') THEN
                -- Profile will be deleted automatically due to ON DELETE CASCADE
                RETURN OLD;
              END IF;
              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
          `);

          // Create trigger on auth.users table
          await connection.queryObject(`
            DROP TRIGGER IF EXISTS on_auth_user_profile_sync ON auth.users
          `);
          await connection.queryObject(`
            CREATE TRIGGER on_auth_user_profile_sync
            AFTER INSERT OR UPDATE OR DELETE ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_user_profile_sync()
          `);

          // Sync existing users to profiles table
          await connection.queryObject(`
            INSERT INTO public.profiles (id, email, name, created_at, updated_at)
            SELECT
              id,
              email,
              COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name'),
              created_at,
              updated_at
            FROM auth.users
            ON CONFLICT (id) DO UPDATE SET
              email = EXCLUDED.email,
              name = COALESCE(EXCLUDED.name, public.profiles.name),
              updated_at = EXCLUDED.updated_at
          `);

          console.log("Profiles table created and synced with auth.users");

          return new Response(
            JSON.stringify({
              success: true,
              message: "Profiles table created successfully with sync trigger",
              details: {
                table: "public.profiles",
                columns: ["id", "email", "name", "avatar_url", "created_at", "updated_at"],
                trigger: "on_auth_user_profile_sync",
                function: "handle_user_profile_sync",
                rls_enabled: true,
                policies: ["Users can view own profile", "Users can update own profile"],
              },
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        } catch (error) {
          console.error("Error creating profiles table:", error);
          return new Response(
            JSON.stringify({
              success: false,
              error: sanitizeError(error),
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }
      }

      // Action: create_table
      if (action === "create_table") {
        const table_name = body.table_name;
        const columns = body.columns; // Array of column objects with name and datatype

        // Input validation
        if (!table_name || !columns || !Array.isArray(columns) || columns.length === 0) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "table_name and columns array are required",
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }

        if (!isValidIdentifier(table_name)) {
          console.warn(`Invalid table name: ${table_name}`);
          return new Response(
            JSON.stringify({
              success: false,
              error: "Invalid table name",
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }

        // Map simplified datatypes to PostgreSQL types
        const datatypeMap: Record<string, string> = {
          text: "TEXT",
          number: "NUMERIC",
          boolean: "BOOLEAN",
          date: "TIMESTAMP WITH TIME ZONE",
          json: "JSONB",
        };

        // Validate all column names and datatypes
        for (const column of columns) {
          // Check if column is an object with name and datatype
          if (typeof column !== "object" || !column.name || !column.datatype) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "Each column must be an object with 'name' and 'datatype' properties",
              }),
              {
                status: 400,
                headers: {
                  "Content-Type": "application/json",
                },
              },
            );
          }

          if (!isValidIdentifier(column.name)) {
            console.warn(`Invalid column name: ${column.name}`);
            return new Response(
              JSON.stringify({
                success: false,
                error: `Invalid column name: ${column.name}`,
              }),
              {
                status: 400,
                headers: {
                  "Content-Type": "application/json",
                },
              },
            );
          }

          // Validate datatype
          if (!datatypeMap[column.datatype.toLowerCase()]) {
            return new Response(
              JSON.stringify({
                success: false,
                error: `Invalid datatype '${column.datatype}' for column '${column.name}'. Allowed: text, number, boolean, date, json`,
              }),
              {
                status: 400,
                headers: {
                  "Content-Type": "application/json",
                },
              },
            );
          }
        }

        // Check if table already exists
        const tableCheck = await connection.queryObject<{ exists: boolean }>(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = $1
          )`,
          [table_name],
        );

        if (tableCheck.rows[0]?.exists) {
          console.warn(`Table already exists: ${table_name}`);
          return new Response(
            JSON.stringify({
              success: false,
              error: "Table already exists",
            }),
            {
              status: 409,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }

        // Build column definitions with specified datatypes
        const columnDefinitions = columns
          .map((col) => `"${col.name}" ${datatypeMap[col.datatype.toLowerCase()]}`)
          .join(", ");

        // Create table with all TEXT columns and user_id for RLS
        await connection.queryObject(`
          CREATE TABLE public."${table_name}" (
            id SERIAL PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            ${columnDefinitions},
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          )
        `);

        console.log(`Table created: ${table_name} with ${columns.length} columns`);

        // Enable Row Level Security
        await connection.queryObject(`
          ALTER TABLE public."${table_name}" ENABLE ROW LEVEL SECURITY
        `);

        // Create RLS policy: Users can only view their own data
        await connection.queryObject(`
          CREATE POLICY "Users can view own data"
          ON public."${table_name}"
          FOR SELECT
          USING (auth.uid() = user_id)
        `);

        // Create RLS policy: Users can only insert their own data
        await connection.queryObject(`
          CREATE POLICY "Users can insert own data"
          ON public."${table_name}"
          FOR INSERT
          WITH CHECK (auth.uid() = user_id)
        `);

        // Create RLS policy: Users can only update their own data
        await connection.queryObject(`
          CREATE POLICY "Users can update own data"
          ON public."${table_name}"
          FOR UPDATE
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id)
        `);

        // Create RLS policy: Users can only delete their own data
        await connection.queryObject(`
          CREATE POLICY "Users can delete own data"
          ON public."${table_name}"
          FOR DELETE
          USING (auth.uid() = user_id)
        `);

        console.log(`RLS enabled and policies created for table: ${table_name}`);

        // Get created table structure
        const tableSchema = await connection.queryObject(
          `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position
        `,
          [table_name],
        );

        return new Response(
          JSON.stringify({
            success: true,
            message: `Table '${table_name}' created successfully with ${columns.length} columns, RLS enabled`,
            table_name: table_name,
            schema: "public",
            rls_enabled: true,
            policies: [
              "Users can view own data",
              "Users can insert own data",
              "Users can update own data",
              "Users can delete own data",
            ],
            columns: tableSchema.rows,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      // Action: get_table_schema
      if (action === "get_table_schema") {
        const table_name = body.table_name;
        // Input validation
        if (!table_name) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "table_name is required",
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }
        if (!isValidIdentifier(table_name)) {
          console.warn(`Invalid table name: ${table_name}`);
          return new Response(
            JSON.stringify({
              success: false,
              error: "Invalid table name",
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }

        // Check if table exists in public schema
        const tableCheck = await connection.queryObject<{ exists: boolean }>(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = $1
          )`,
          [table_name],
        );
        if (!tableCheck.rows[0]?.exists) {
          console.warn(`Table does not exist: ${table_name}`);
          return new Response(
            JSON.stringify({
              success: false,
              error: "Table does not exist",
            }),
            {
              status: 404,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }

        // Get table schema with column details, including primary key and unique constraints
        const columns = await connection.queryObject(
          `
          SELECT
            c.column_name,
            c.data_type,
            c.character_maximum_length,
            c.is_nullable,
            c.column_default,
            CASE
              WHEN pk.column_name IS NOT NULL THEN true
              ELSE false
            END AS is_primary_key,
            CASE
              WHEN uq.column_name IS NOT NULL THEN true
              ELSE false
            END AS is_unique
          FROM information_schema.columns c
          LEFT JOIN (
            SELECT ku.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage ku
              ON tc.constraint_name = ku.constraint_name
              AND tc.table_schema = ku.table_schema
            WHERE tc.constraint_type = 'PRIMARY KEY'
              AND tc.table_schema = 'public'
              AND tc.table_name = $1
          ) pk ON c.column_name = pk.column_name
          LEFT JOIN (
            SELECT ku.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage ku
              ON tc.constraint_name = ku.constraint_name
              AND tc.table_schema = ku.table_schema
            WHERE tc.constraint_type = 'UNIQUE'
              AND tc.table_schema = 'public'
              AND tc.table_name = $1
          ) uq ON c.column_name = uq.column_name
          WHERE c.table_schema = 'public'
            AND c.table_name = $1
          ORDER BY c.ordinal_position
        `,
          [table_name],
        );

        console.log(`Retrieved schema for table: ${table_name} (${columns.rowCount} columns)`);
        return new Response(
          JSON.stringify({
            success: true,
            table_name: table_name,
            schema: "public",
            columns: columns.rows,
            count: columns.rowCount,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      // Unknown action
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unknown action",
          available_actions: [
            "get_service_key",
            "test_connection",
            "list_tables",
            "create_table",
            "manage_column (subactions: add, update_type, rename, drop)",
            "create_trigger",
            "remove_trigger",
            "debug_trigger",
            "get_table_schema",
            "create_profile_table",
          ],
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error in meerkats_automation:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: sanitizeError(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
});
