import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncAllUserRoles() {
  console.log("Fetching all users from Prisma...");
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true },
  });

  console.log(`Found ${users.length} users. Syncing roles to Supabase...`);

  let success = 0;
  let failed = 0;

  for (const user of users) {
    try {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: { role: user.role },
      });

      if (error) {
        console.error(`Failed to sync ${user.email}:`, error.message);
        failed++;
      } else {
        console.log(`✓ Synced ${user.email} (${user.role})`);
        success++;
      }
    } catch (err) {
      console.error(`Error syncing ${user.email}:`, err);
      failed++;
    }
  }

  console.log(`\nDone: ${success} succeeded, ${failed} failed`);
  await prisma.$disconnect();
}

syncAllUserRoles().catch(console.error);