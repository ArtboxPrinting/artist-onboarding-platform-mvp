#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://qnnrnawuepyporiagqqr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFubnJuYXd1ZXB5cG9yaWFncXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMTc3OTEsImV4cCI6MjA2Mzg5Mzc5MX0.PhqDkU9K0WnZSQWXsGVSlzb3pyuw3ayIACTn-gwsvRo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSQLFile(filePath) {
  try {
    console.log(`\n🗄️ Running SQL file: ${filePath}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error(`❌ Error in ${filePath}:`, error);
      return false;
    }
    
    console.log(`✅ Successfully ran ${filePath}`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to run ${filePath}:`, err.message);
    return false;
  }
}

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...\n');
  
  const sqlFiles = [
    '../supabase-setup/01-create-tables.sql',
    '../supabase-setup/02-additional-tables.sql',
    '../supabase-setup/03-functions-triggers.sql',
    '../supabase-setup/04-storage-rls.sql'
  ];
  
  for (const file of sqlFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const success = await runSQLFile(filePath);
      if (!success) {
        console.log('❌ Database setup failed. Stopping.');
        process.exit(1);
      }
      // Wait a bit between files
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.error(`❌ SQL file not found: ${filePath}`);
      process.exit(1);
    }
  }
  
  console.log('\n🎉 Database setup complete!');
  console.log('🔗 You can now deploy your application.');
}

setupDatabase();