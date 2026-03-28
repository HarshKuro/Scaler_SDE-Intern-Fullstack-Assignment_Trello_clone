import dotenv from 'dotenv';
dotenv.config();

import { supabase } from './supabase';

async function seed() {
  console.log('ðŸŒ± Starting database seed...');

  // Clear existing data (in reverse dependency order)
  console.log('Clearing existing data...');
  await supabase.from('activity_log').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('attachments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('checklist_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('checklists').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('card_members').delete().neq('card_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('card_labels').delete().neq('card_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('cards').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('labels').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('lists').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('boards').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('members').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Seed members
  console.log('Seeding members...');
  const { data: members, error: membersError } = await supabase
    .from('members')
    .insert([
      { full_name: 'Harsh Gupta', email: 'harsh@example.com', avatar_color: '#0079bf', initials: 'HG' },
      { full_name: 'Ananya Rao', email: 'ananya@example.com', avatar_color: '#eb5a46', initials: 'AR' },
      { full_name: 'Rohan Sharma', email: 'rohan@example.com', avatar_color: '#61bd4f', initials: 'RS' },
      { full_name: 'Priya Kumar', email: 'priya@example.com', avatar_color: '#c377e0', initials: 'PK' },
      { full_name: 'Vikram Singh', email: 'vikram@example.com', avatar_color: '#ff9f1a', initials: 'VS' },
    ])
    .select();

  if (membersError) {
    console.error('Error seeding members:', membersError);
    process.exit(1);
  }
  console.log(`âœ… Seeded ${members.length} members`);

  const [hg, ar, rs, pk, vs] = members;

  // Seed boards
  console.log('Seeding boards...');
  const { data: boards, error: boardsError } = await supabase
    .from('boards')
    .insert([
      {
        title: 'My Trello Board',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
        is_starred: true,
      },
      {
        title: 'Development Sprint',
        background: '#0079bf',
      },
    ])
    .select();

  if (boardsError) {
    console.error('Error seeding boards:', boardsError);
    process.exit(1);
  }
  console.log(`âœ… Seeded ${boards.length} boards`);

  const [board1, board2] = boards;

  // Seed labels for Board 1
  console.log('Seeding labels...');
  const { data: labels, error: labelsError } = await supabase
    .from('labels')
    .insert([
      { board_id: board1.id, name: 'Feature', color: '#61bd4f' },
      { board_id: board1.id, name: 'Bug', color: '#f2d600' },
      { board_id: board1.id, name: 'Design', color: '#ff9f1a' },
      { board_id: board1.id, name: 'Critical', color: '#eb5a46' },
      { board_id: board1.id, name: 'Enhancement', color: '#c377e0' },
      { board_id: board1.id, name: 'Research', color: '#0079bf' },
    ])
    .select();

  if (labelsError) {
    console.error('Error seeding labels:', labelsError);
    process.exit(1);
  }
  console.log(`âœ… Seeded ${labels.length} labels`);

  const [labelFeature, labelBug, labelDesign, labelCritical, labelEnhancement, labelResearch] = labels;

  // Seed labels for Board 2
  const { error: labels2Error } = await supabase
    .from('labels')
    .insert([
      { board_id: board2.id, name: '', color: '#61bd4f' },
      { board_id: board2.id, name: '', color: '#f2d600' },
      { board_id: board2.id, name: '', color: '#ff9f1a' },
      { board_id: board2.id, name: '', color: '#eb5a46' },
      { board_id: board2.id, name: '', color: '#c377e0' },
      { board_id: board2.id, name: '', color: '#0079bf' },
    ]);
  if (labels2Error) console.error('Error seeding board 2 labels:', labels2Error);

  // Seed lists for Board 1
  console.log('Seeding lists...');
  const { data: lists, error: listsError } = await supabase
    .from('lists')
    .insert([
      { board_id: board1.id, title: 'To Do', position: 1000 },
      { board_id: board1.id, title: 'Doing', position: 2000 },
      { board_id: board1.id, title: 'Done', position: 3000 },
      { board_id: board1.id, title: 'Backlog', position: 4000 },
    ])
    .select();

  if (listsError) {
    console.error('Error seeding lists:', listsError);
    process.exit(1);
  }
  console.log(`âœ… Seeded ${lists.length} lists`);

  const [todoList, doingList, doneList, backlogList] = lists;

  // Seed lists for Board 2
  await supabase.from('lists').insert([
    { board_id: board2.id, title: 'Sprint Backlog', position: 1000 },
    { board_id: board2.id, title: 'In Progress', position: 2000 },
    { board_id: board2.id, title: 'Review', position: 3000 },
    { board_id: board2.id, title: 'Completed', position: 4000 },
  ]);

  // Seed cards
  console.log('Seeding cards...');
  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .insert([
      // To Do
      {
        list_id: todoList.id,
        title: 'Set up project repository',
        description: 'Initialize the monorepo structure with frontend and backend workspaces. Set up CI/CD pipeline.',
        position: 1000,
        cover_color: '#0079bf',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        list_id: todoList.id,
        title: 'Design database schema',
        description: 'Create the complete database schema for all entities including boards, lists, cards, labels, etc.',
        position: 2000,
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        list_id: todoList.id,
        title: 'Implement authentication flow',
        position: 3000,
      },
      {
        list_id: todoList.id,
        title: 'Create API documentation',
        description: 'Document all REST API endpoints with request/response examples.',
        position: 4000,
      },
      // Doing
      {
        list_id: doingList.id,
        title: 'Build card drag-and-drop',
        description: 'Implement drag and drop for cards using @dnd-kit. Support both same-list and cross-list dragging.',
        position: 1000,
        cover_color: '#61bd4f',
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        list_id: doingList.id,
        title: 'Style board page layout',
        description: 'Apply Trello-exact dark theme styling to the board page, lists, and cards.',
        position: 2000,
        cover_color: '#c377e0',
      },
      {
        list_id: doingList.id,
        title: 'Implement card modal',
        position: 3000,
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      // Done
      {
        list_id: doneList.id,
        title: 'Set up Next.js project',
        description: 'Initialize Next.js 16 with App Router, TypeScript, and Tailwind CSS 4.',
        position: 1000,
        is_complete: true,
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        list_id: doneList.id,
        title: 'Configure Supabase',
        position: 2000,
        is_complete: true,
      },
      // Backlog
      {
        list_id: backlogList.id,
        title: 'Add board background customization',
        description: 'Allow users to change board backgrounds with colors, gradients, and images.',
        position: 1000,
      },
      {
        list_id: backlogList.id,
        title: 'Implement search functionality',
        position: 2000,
      },
      {
        list_id: backlogList.id,
        title: 'Add mobile responsive design',
        description: 'Ensure the app works well on mobile and tablet devices.',
        position: 3000,
      },
    ])
    .select();

  if (cardsError) {
    console.error('Error seeding cards:', cardsError);
    process.exit(1);
  }
  console.log(`âœ… Seeded ${cards.length} cards`);

  // Assign labels to cards
  console.log('Assigning labels to cards...');
  await supabase.from('card_labels').insert([
    { card_id: cards[0].id, label_id: labelFeature.id },
    { card_id: cards[0].id, label_id: labelResearch.id },
    { card_id: cards[1].id, label_id: labelDesign.id },
    { card_id: cards[2].id, label_id: labelFeature.id },
    { card_id: cards[3].id, label_id: labelResearch.id },
    { card_id: cards[4].id, label_id: labelFeature.id },
    { card_id: cards[4].id, label_id: labelCritical.id },
    { card_id: cards[5].id, label_id: labelDesign.id },
    { card_id: cards[5].id, label_id: labelEnhancement.id },
    { card_id: cards[6].id, label_id: labelFeature.id },
    { card_id: cards[7].id, label_id: labelFeature.id },
    { card_id: cards[9].id, label_id: labelEnhancement.id },
    { card_id: cards[10].id, label_id: labelFeature.id },
    { card_id: cards[11].id, label_id: labelBug.id },
  ]);

  // Assign members to cards
  console.log('Assigning members to cards...');
  await supabase.from('card_members').insert([
    { card_id: cards[0].id, member_id: hg.id },
    { card_id: cards[0].id, member_id: rs.id },
    { card_id: cards[1].id, member_id: ar.id },
    { card_id: cards[2].id, member_id: pk.id },
    { card_id: cards[4].id, member_id: hg.id },
    { card_id: cards[4].id, member_id: vs.id },
    { card_id: cards[5].id, member_id: ar.id },
    { card_id: cards[6].id, member_id: rs.id },
    { card_id: cards[7].id, member_id: hg.id },
    { card_id: cards[9].id, member_id: pk.id },
    { card_id: cards[10].id, member_id: vs.id },
  ]);

  // Seed checklists
  console.log('Seeding checklists...');
  const { data: checklists } = await supabase
    .from('checklists')
    .insert([
      { card_id: cards[0].id, title: 'Setup Tasks', position: 1000 },
      { card_id: cards[4].id, title: 'DnD Implementation', position: 1000 },
      { card_id: cards[6].id, title: 'Modal Components', position: 1000 },
    ])
    .select();

  if (checklists) {
    await supabase.from('checklist_items').insert([
      // Setup Tasks checklist
      { checklist_id: checklists[0].id, title: 'Initialize Git repository', is_checked: true, position: 1000 },
      { checklist_id: checklists[0].id, title: 'Set up monorepo structure', is_checked: true, position: 2000 },
      { checklist_id: checklists[0].id, title: 'Configure ESLint and Prettier', is_checked: false, position: 3000 },
      { checklist_id: checklists[0].id, title: 'Set up CI/CD pipeline', is_checked: false, position: 4000 },
      // DnD Implementation checklist
      { checklist_id: checklists[1].id, title: 'Install @dnd-kit packages', is_checked: true, position: 1000 },
      { checklist_id: checklists[1].id, title: 'Implement card sorting within lists', is_checked: true, position: 2000 },
      { checklist_id: checklists[1].id, title: 'Implement cross-list card dragging', is_checked: false, position: 3000 },
      { checklist_id: checklists[1].id, title: 'Add drag overlay animation', is_checked: false, position: 4000 },
      // Modal Components checklist
      { checklist_id: checklists[2].id, title: 'Modal skeleton layout', is_checked: true, position: 1000 },
      { checklist_id: checklists[2].id, title: 'Labels section', is_checked: false, position: 2000 },
      { checklist_id: checklists[2].id, title: 'Members section', is_checked: false, position: 3000 },
      { checklist_id: checklists[2].id, title: 'Due date picker', is_checked: false, position: 4000 },
      { checklist_id: checklists[2].id, title: 'Checklist section', is_checked: false, position: 5000 },
      { checklist_id: checklists[2].id, title: 'Comments section', is_checked: false, position: 6000 },
    ]);
  }

  // Seed comments
  console.log('Seeding comments...');
  await supabase.from('comments').insert([
    {
      card_id: cards[0].id,
      member_id: hg.id,
      text: 'I have started working on the repository setup. Will push the initial commit today.',
    },
    {
      card_id: cards[0].id,
      member_id: rs.id,
      text: 'Great! Let me know if you need help with the CI/CD configuration.',
    },
    {
      card_id: cards[4].id,
      member_id: hg.id,
      text: 'The basic drag and drop is working now. Still need to handle cross-list movement.',
    },
    {
      card_id: cards[4].id,
      member_id: vs.id,
      text: 'Nice progress! Make sure to add the spring animation for smooth transitions.',
    },
    {
      card_id: cards[5].id,
      member_id: ar.id,
      text: 'Following the exact Trello color palette. The dark theme looks great!',
    },
  ]);

  // Seed activity log
  console.log('Seeding activity log...');
  await supabase.from('activity_log').insert([
    {
      board_id: board1.id,
      card_id: cards[0].id,
      member_id: hg.id,
      action: 'card_created',
      data: { card_title: 'Set up project repository', list_title: 'To Do' },
    },
    {
      board_id: board1.id,
      card_id: cards[4].id,
      member_id: hg.id,
      action: 'card_moved',
      data: { card_title: 'Build card drag-and-drop', from_list: 'To Do', to_list: 'Doing' },
    },
    {
      board_id: board1.id,
      card_id: cards[7].id,
      member_id: hg.id,
      action: 'card_moved',
      data: { card_title: 'Set up Next.js project', from_list: 'Doing', to_list: 'Done' },
    },
    {
      board_id: board1.id,
      card_id: cards[4].id,
      member_id: vs.id,
      action: 'member_assigned',
      data: { card_title: 'Build card drag-and-drop', member_name: 'Vikram Singh' },
    },
  ]);

  console.log('');
  console.log('ðŸŽ‰ Database seeded successfully!');
  console.log(`   - ${members.length} members`);
  console.log(`   - ${boards.length} boards`);
  console.log(`   - ${lists.length} lists (Board 1) + 4 lists (Board 2)`);
  console.log(`   - ${labels.length} labels (Board 1) + 6 labels (Board 2)`);
  console.log(`   - ${cards.length} cards`);
  console.log('   - Card labels, members, checklists, comments, and activity seeded');

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
