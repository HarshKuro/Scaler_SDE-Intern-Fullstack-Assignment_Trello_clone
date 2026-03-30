/**
 * KanFlow — Comprehensive Test Script
 *
 * Tests: Database connection, all backend API endpoints (CRUD lifecycle),
 * and frontend build/accessibility.
 *
 * Usage:
 *   1. Start the backend:  pnpm dev:backend
 *   2. In another terminal: npx ts-node test-all.ts
 */

const API = process.env.API_URL || 'http://localhost:5000/api';
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';

/* ── Helpers ─────────────────────────────────────────── */

let passed = 0;
let failed = 0;
let skipped = 0;
const failures: string[] = [];

function log(icon: string, msg: string) {
  console.log(`  ${icon} ${msg}`);
}

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed++;
    log('✅', name);
  } catch (err: unknown) {
    failed++;
    const msg = err instanceof Error ? err.message : String(err);
    log('❌', `${name} — ${msg}`);
    failures.push(`${name}: ${msg}`);
  }
}

function skip(name: string, reason: string) {
  skipped++;
  log('⏭️', `${name} — SKIPPED (${reason})`);
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

async function request(
  method: string,
  path: string,
  body?: Record<string, unknown>,
): Promise<{ status: number; data: Record<string, unknown> }> {
  const url = `${API}${path}`;
  const opts: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  let data: Record<string, unknown>;
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    data = {};
  }
  return { status: res.status, data };
}

/* ── State (IDs created during tests) ────────────────── */

let boardId: string;
let listId: string;
let cardId: string;
let labelId: string;
let memberId: string;
let checklistId: string;
let checklistItemId: string;
let commentId: string;

/* ── Test Suites ─────────────────────────────────────── */

async function testHealth() {
  console.log('\n📡 Backend Health');

  await test('GET /health returns ok', async () => {
    const { status, data } = await request('GET', '/health');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.status === 'ok', `Expected status ok, got ${data.status}`);
    assert(typeof data.timestamp === 'string', 'Missing timestamp');
  });
}

async function testDatabase() {
  console.log('\n🗄️  Database (via Members endpoint)');

  await test('GET /members returns array (DB connected)', async () => {
    const { status, data } = await request('GET', '/members');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(data.data), 'Expected data array');
    assert((data.data as unknown[]).length > 0, 'No members found — was the DB seeded?');

    // Store a member ID for later tests
    memberId = (data.data as Record<string, unknown>[])[0].id as string;
  });
}

async function testBoards() {
  console.log('\n📋 Boards CRUD');

  await test('POST /boards — create board', async () => {
    const { status, data } = await request('POST', '/boards', {
      title: '__test_board__',
      background: '#ff0000',
    });
    assert(status === 201, `Expected 201, got ${status}`);
    assert(data.error === null, `Error: ${JSON.stringify(data.error)}`);
    boardId = (data.data as Record<string, unknown>).id as string;
    assert(!!boardId, 'Missing board ID');
  });

  await test('GET /boards — list boards', async () => {
    const { status, data } = await request('GET', '/boards');
    assert(status === 200, `Expected 200, got ${status}`);
    const boards = data.data as Record<string, unknown>[];
    assert(boards.some((b) => b.id === boardId), 'Created board not in list');
  });

  await test('GET /boards/:id — get board detail', async () => {
    const { status, data } = await request('GET', `/boards/${boardId}`);
    assert(status === 200, `Expected 200, got ${status}`);
    const board = data.data as Record<string, unknown>;
    assert(board.title === '__test_board__', 'Title mismatch');
    assert(Array.isArray(board.lists), 'Missing lists array');
    assert(Array.isArray(board.labels), 'Missing labels array');
    assert(Array.isArray(board.members), 'Missing members array');
  });

  await test('PATCH /boards/:id — update board', async () => {
    const { status, data } = await request('PATCH', `/boards/${boardId}`, {
      title: '__test_board_updated__',
      is_starred: true,
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(
      (data.data as Record<string, unknown>).title === '__test_board_updated__',
      'Title not updated',
    );
  });

  await test('GET /boards/:id/activity — board activity', async () => {
    const { status, data } = await request('GET', `/boards/${boardId}/activity`);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(data.data), 'Expected activity array');
  });
}

async function testLabels() {
  console.log('\n🏷️  Labels CRUD');

  await test('GET /boards/:id/labels — list labels', async () => {
    const { status, data } = await request('GET', `/boards/${boardId}/labels`);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(data.data), 'Expected labels array');
    assert((data.data as unknown[]).length === 6, 'Expected 6 default labels');
  });

  await test('POST /boards/:id/labels — create label', async () => {
    const { status, data } = await request('POST', `/boards/${boardId}/labels`, {
      name: 'Test Label',
      color: '#123456',
    });
    assert(status === 201, `Expected 201, got ${status}`);
    labelId = (data.data as Record<string, unknown>).id as string;
    assert(!!labelId, 'Missing label ID');
  });

  await test('PATCH /labels/:id — update label', async () => {
    const { status, data } = await request('PATCH', `/labels/${labelId}`, {
      name: 'Updated Label',
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(
      (data.data as Record<string, unknown>).name === 'Updated Label',
      'Name not updated',
    );
  });
}

async function testLists() {
  console.log('\n📝 Lists CRUD');

  await test('POST /lists — create list', async () => {
    const { status, data } = await request('POST', '/lists', {
      board_id: boardId,
      title: '__test_list__',
    });
    assert(status === 201, `Expected 201, got ${status}`);
    listId = (data.data as Record<string, unknown>).id as string;
    assert(!!listId, 'Missing list ID');
  });

  await test('PATCH /lists/:id — update list', async () => {
    const { status, data } = await request('PATCH', `/lists/${listId}`, {
      title: '__test_list_updated__',
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(
      (data.data as Record<string, unknown>).title === '__test_list_updated__',
      'Title not updated',
    );
  });

  await test('PATCH /lists/reorder — reorder lists', async () => {
    const { status, data } = await request('PATCH', '/lists/reorder', {
      items: [{ id: listId, position: 5000 }],
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert((data.data as Record<string, unknown>).updated === 1, 'Expected 1 updated');
  });
}

async function testCards() {
  console.log('\n🃏 Cards CRUD');

  await test('POST /cards — create card', async () => {
    const { status, data } = await request('POST', '/cards', {
      list_id: listId,
      title: '__test_card__',
    });
    assert(status === 201, `Expected 201, got ${status}`);
    cardId = (data.data as Record<string, unknown>).id as string;
    assert(!!cardId, 'Missing card ID');
  });

  await test('GET /cards/:id — get card detail', async () => {
    const { status, data } = await request('GET', `/cards/${cardId}`);
    assert(status === 200, `Expected 200, got ${status}`);
    const card = data.data as Record<string, unknown>;
    assert(card.title === '__test_card__', 'Title mismatch');
    assert(card.board_id === boardId, 'board_id not populated');
    assert(Array.isArray(card.labels), 'Missing labels');
    assert(Array.isArray(card.members), 'Missing members');
    assert(Array.isArray(card.checklists), 'Missing checklists');
    assert(Array.isArray(card.attachments), 'Missing attachments');
    assert(Array.isArray(card.comments), 'Missing comments');
  });

  await test('PATCH /cards/:id — update card', async () => {
    const { status, data } = await request('PATCH', `/cards/${cardId}`, {
      title: '__test_card_updated__',
      description: 'Test description',
      due_date: new Date(Date.now() + 86400000).toISOString(),
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(
      (data.data as Record<string, unknown>).title === '__test_card_updated__',
      'Title not updated',
    );
  });

  await test('GET /cards/search?q=__test_card — search cards', async () => {
    const { status, data } = await request('GET', '/cards/search?q=__test_card');
    assert(status === 200, `Expected 200, got ${status}`);
    const cards = data.data as Record<string, unknown>[];
    assert(cards.length >= 1, 'Search returned no results');
    assert(cards.some((c) => c.id === cardId), 'Test card not in search results');
  });

  await test('PATCH /cards/reorder — reorder cards', async () => {
    const { status, data } = await request('PATCH', '/cards/reorder', {
      items: [{ id: cardId, position: 9000 }],
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert((data.data as Record<string, unknown>).updated === 1, 'Expected 1 updated');
  });
}

async function testCardLabels() {
  console.log('\n🔗 Card ↔ Label Assignment');

  await test('POST /cards/:id/labels/:labelId — add label to card', async () => {
    const { status } = await request('POST', `/cards/${cardId}/labels/${labelId}`);
    assert(status === 201, `Expected 201, got ${status}`);
  });

  await test('Verify label appears on card', async () => {
    const { data } = await request('GET', `/cards/${cardId}`);
    const labels = (data.data as Record<string, unknown>).labels as Record<string, unknown>[];
    assert(labels.some((l) => l.id === labelId), 'Label not found on card');
  });

  await test('DELETE /cards/:id/labels/:labelId — remove label from card', async () => {
    const { status } = await request('DELETE', `/cards/${cardId}/labels/${labelId}`);
    assert(status === 200, `Expected 200, got ${status}`);
  });
}

async function testCardMembers() {
  console.log('\n👥 Card ↔ Member Assignment');

  await test('POST /members/:memberId/cards/:id — add member to card', async () => {
    const { status } = await request('POST', `/members/${memberId}/cards/${cardId}`);
    assert(status === 201, `Expected 201, got ${status}`);
  });

  await test('Verify member appears on card', async () => {
    const { data } = await request('GET', `/cards/${cardId}`);
    const members = (data.data as Record<string, unknown>).members as Record<string, unknown>[];
    assert(members.some((m) => m.id === memberId), 'Member not found on card');
  });

  await test('DELETE /members/:memberId/cards/:id — remove member from card', async () => {
    const { status } = await request('DELETE', `/members/${memberId}/cards/${cardId}`);
    assert(status === 200, `Expected 200, got ${status}`);
  });
}

async function testChecklists() {
  console.log('\n☑️  Checklists CRUD');

  await test('POST /cards/:id/checklists — create checklist', async () => {
    const { status, data } = await request('POST', `/cards/${cardId}/checklists`, {
      title: 'Test Checklist',
    });
    assert(status === 201, `Expected 201, got ${status}`);
    checklistId = (data.data as Record<string, unknown>).id as string;
    assert(!!checklistId, 'Missing checklist ID');
  });

  await test('PATCH /checklists/:id — update checklist', async () => {
    const { status, data } = await request('PATCH', `/checklists/${checklistId}`, {
      title: 'Updated Checklist',
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(
      (data.data as Record<string, unknown>).title === 'Updated Checklist',
      'Title not updated',
    );
  });

  await test('POST /checklists/:id/items — add checklist item', async () => {
    const { status, data } = await request('POST', `/checklists/${checklistId}/items`, {
      title: 'Test Item',
    });
    assert(status === 201, `Expected 201, got ${status}`);
    checklistItemId = (data.data as Record<string, unknown>).id as string;
    assert(!!checklistItemId, 'Missing item ID');
  });

  await test('PATCH /checklist-items/:id — toggle item', async () => {
    const { status, data } = await request('PATCH', `/checklist-items/${checklistItemId}`, {
      is_checked: true,
    });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(
      (data.data as Record<string, unknown>).is_checked === true,
      'Item not checked',
    );
  });

  await test('DELETE /checklist-items/:id — delete item', async () => {
    const { status } = await request('DELETE', `/checklist-items/${checklistItemId}`);
    assert(status === 200, `Expected 200, got ${status}`);
  });

  await test('DELETE /checklists/:id — delete checklist', async () => {
    const { status } = await request('DELETE', `/checklists/${checklistId}`);
    assert(status === 200, `Expected 200, got ${status}`);
  });
}

async function testComments() {
  console.log('\n💬 Comments CRUD');

  await test('POST /cards/:id/comments — add comment', async () => {
    const { status, data } = await request('POST', `/cards/${cardId}/comments`, {
      member_id: memberId,
      text: 'Test comment',
    });
    assert(status === 201, `Expected 201, got ${status}`);
    const comment = data.data as Record<string, unknown>;
    commentId = comment.id as string;
    assert(!!commentId, 'Missing comment ID');
    assert(comment.member !== null, 'Member not populated on comment');
  });

  await test('GET /cards/:id/comments — list comments', async () => {
    const { status, data } = await request('GET', `/cards/${cardId}/comments`);
    assert(status === 200, `Expected 200, got ${status}`);
    const comments = data.data as Record<string, unknown>[];
    assert(comments.length >= 1, 'No comments returned');
    assert(comments[0].member !== null, 'Member not joined on comment');
  });

  await test('PATCH /comments/:id — update comment', async () => {
    const { status, data } = await request('PATCH', `/comments/${commentId}`, {
      text: 'Updated comment',
    });
    assert(status === 200, `Expected 200, got ${status}`);
    const comment = data.data as Record<string, unknown>;
    assert(comment.text === 'Updated comment', 'Text not updated');
    assert(comment.member !== null, 'Member not populated');
  });

  await test('DELETE /comments/:id — delete comment', async () => {
    const { status } = await request('DELETE', `/comments/${commentId}`);
    assert(status === 200, `Expected 200, got ${status}`);
  });
}

async function testCleanup() {
  console.log('\n🧹 Cleanup (Delete test data)');

  await test('DELETE /labels/:id — delete test label', async () => {
    const { status } = await request('DELETE', `/labels/${labelId}`);
    assert(status === 200, `Expected 200, got ${status}`);
  });

  await test('DELETE /cards/:id — delete test card', async () => {
    const { status } = await request('DELETE', `/cards/${cardId}`);
    assert(status === 200, `Expected 200, got ${status}`);
  });

  await test('DELETE /lists/:id — delete test list', async () => {
    const { status } = await request('DELETE', `/lists/${listId}`);
    assert(status === 200, `Expected 200, got ${status}`);
  });

  await test('DELETE /boards/:id — delete test board', async () => {
    const { status } = await request('DELETE', `/boards/${boardId}`);
    assert(status === 200, `Expected 200, got ${status}`);
  });

  await test('Verify board is gone from listing', async () => {
    const { data } = await request('GET', '/boards');
    const boards = data.data as Record<string, unknown>[];
    assert(!boards.some((b) => b.id === boardId), 'Board still exists after delete');
  });
}

async function testFrontend() {
  console.log('\n🌐 Frontend');

  await test(`Frontend reachable at ${FRONTEND}`, async () => {
    try {
      const res = await fetch(FRONTEND, { signal: AbortSignal.timeout(5000) });
      assert(res.ok, `Expected 200, got ${res.status}`);
      const html = await res.text();
      assert(html.includes('<'), 'Response is not HTML');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('ECONNREFUSED') || msg.includes('TimeoutError')) {
        throw new Error(`Frontend not running at ${FRONTEND} — start with: pnpm dev:frontend`);
      }
      throw err;
    }
  });
}

/* ── Seeded Data Check ───────────────────────────────── */

async function testSeededData() {
  console.log('\n🌱 Seeded Data Integrity');

  await test('Members table has 5 seeded members', async () => {
    const { data } = await request('GET', '/members');
    assert((data.data as unknown[]).length >= 5, 'Expected at least 5 members');
  });

  await test('Boards table has seeded boards', async () => {
    const { data } = await request('GET', '/boards');
    const boards = data.data as Record<string, unknown>[];
    assert(boards.length >= 2, 'Expected at least 2 seeded boards');
  });

  await test('Seeded board has lists with nested cards', async () => {
    const { data: boardsRes } = await request('GET', '/boards');
    const boards = boardsRes.data as Record<string, unknown>[];
    const seeded = boards.find((b) => b.title === 'My Trello Board');
    if (!seeded) throw new Error('Seeded board "My Trello Board" not found');

    const { data } = await request('GET', `/boards/${seeded.id}`);
    const board = data.data as Record<string, unknown>;
    const lists = board.lists as Record<string, unknown>[];
    assert(lists.length >= 4, `Expected ≥4 lists, got ${lists.length}`);

    // Check nested cards
    const cardsInLists = lists.reduce(
      (sum, l) => sum + ((l.cards as unknown[])?.length || 0),
      0,
    );
    assert(cardsInLists >= 8, `Expected ≥8 cards across lists, got ${cardsInLists}`);
  });

  await test('Seeded cards have labels, members, checklists', async () => {
    const { data: boardsRes } = await request('GET', '/boards');
    const boards = boardsRes.data as Record<string, unknown>[];
    const seeded = boards.find((b) => b.title === 'My Trello Board');
    if (!seeded) throw new Error('Seeded board not found');

    const { data } = await request('GET', `/boards/${seeded.id}`);
    const board = data.data as Record<string, unknown>;
    const lists = board.lists as Record<string, unknown>[];
    const allCards = lists.flatMap((l) => (l.cards as Record<string, unknown>[]) || []);

    const hasLabels = allCards.some(
      (c) => ((c.labels as unknown[])?.length || 0) > 0,
    );
    const hasMembers = allCards.some(
      (c) => ((c.members as unknown[])?.length || 0) > 0,
    );
    const hasChecklists = allCards.some(
      (c) => ((c.checklists as unknown[])?.length || 0) > 0,
    );

    assert(hasLabels, 'No cards have labels assigned');
    assert(hasMembers, 'No cards have members assigned');
    assert(hasChecklists, 'No cards have checklists');
  });

  await test('Activity log has entries', async () => {
    const { data: boardsRes } = await request('GET', '/boards');
    const boards = boardsRes.data as Record<string, unknown>[];
    const seeded = boards.find((b) => b.title === 'My Trello Board');
    if (!seeded) throw new Error('Seeded board not found');

    const { data } = await request('GET', `/boards/${seeded.id}/activity`);
    const activity = data.data as Record<string, unknown>[];
    assert(activity.length >= 1, 'No activity log entries');
    assert(activity[0].member !== null, 'Activity member not joined');
  });
}

/* ── Main ────────────────────────────────────────────── */

async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   KanFlow — Full Stack Test Suite        ║');
  console.log('╚══════════════════════════════════════════╝');

  // 1. Check backend is reachable
  try {
    await fetch(`${API}/health`, { signal: AbortSignal.timeout(3000) });
  } catch {
    console.error(`\n❌ Backend not reachable at ${API}`);
    console.error('   Start it first: pnpm dev:backend\n');
    process.exit(1);
  }

  // 2. Run all test suites in order
  await testHealth();
  await testDatabase();
  await testSeededData();
  await testBoards();
  await testLabels();
  await testLists();
  await testCards();
  await testCardLabels();
  await testCardMembers();
  await testChecklists();
  await testComments();
  await testCleanup();
  await testFrontend();

  // 3. Summary
  console.log('\n══════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  if (failures.length > 0) {
    console.log('\n  Failures:');
    failures.forEach((f) => console.log(`    • ${f}`));
  }
  console.log('══════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

main();
