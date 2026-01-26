# Testing the Waiting Room System

## Quick Test Guide

### 1. Start the Development Server
The server should be running at `http://localhost:3000`

### 2. Test Scenarios

#### Scenario A: Single Player (Computer Fallback)
1. Navigate to `/games/taboo` or `/games/codenames`
2. You should see the **Waiting Room** with:
   - Your team name displayed
   - Player count: 1 / 4 (or max players)
   - Countdown timer (30 seconds)
   - "No other teams online" message
3. Wait for countdown or click "START VS COMPUTER"
4. Game should proceed to setup phase

#### Scenario B: Multi-Team Join (Two Browsers/Devices)
1. **Browser 1**: Create a team and go to `/games/taboo`
2. **Browser 2**: Create a different team and go to `/games/taboo`
3. In Browser 2, you should see:
   - Browser 1's team in "AVAILABLE TEAMS TO JOIN"
   - Click "JOIN" button
4. In Browser 1, you should see:
   - Browser 2's team has joined
   - Player count increases
   - "START GAME" button becomes available
5. Click "START GAME" to proceed

#### Scenario C: Game Discovery
1. **Browser 1**: Start a game (waiting room)
2. **Browser 2**: Go to same game type
3. You should see:
   - "OTHER [GAME] GAMES WAITING" section
   - Link to join Browser 1's game
4. Click the link to join

### 3. What to Check

✅ **Waiting Room UI**
- [ ] Game icon and name displayed
- [ ] Current team name shown
- [ ] Player count updates correctly
- [ ] Countdown timer works
- [ ] Available teams list refreshes (every 2 seconds)

✅ **Team Joining**
- [ ] Teams can see each other
- [ ] "JOIN" button works
- [ ] Joined teams show "JOINED ✓"
- [ ] Player count increases when team joins

✅ **Game State Sync**
- [ ] Changes in one browser reflect in another
- [ ] Game state persists
- [ ] Teams stay joined after refresh

✅ **Auto-Start**
- [ ] Countdown reaches 0 and auto-starts
- [ ] Computer fallback works
- [ ] Manual start buttons work

✅ **Game Discovery**
- [ ] Other waiting games appear
- [ ] Links to join other games work
- [ ] Filters out current game

### 4. Testing Checklist

**Taboo Game:**
- [ ] Waiting room appears first
- [ ] Teams can join
- [ ] Setup phase works after waiting room
- [ ] Game plays normally

**Codenames Game:**
- [ ] Waiting room appears first
- [ ] Red/Blue team assignment works
- [ ] Teams can join as blue team
- [ ] Game starts correctly

### 5. Common Issues & Fixes

**Issue: Teams not showing up**
- Check if teams are online (activity tracking)
- Verify Supabase connection (if configured)
- Check browser console for errors

**Issue: Game state not syncing**
- Check if `gameId` is set correctly
- Verify Supabase is configured
- Check network tab for API calls

**Issue: Countdown not working**
- Check browser console for errors
- Verify `waitingRoomStartTime` is set
- Check if phase is "waiting"

### 6. Browser Testing

Test in:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browser (responsive design)

### 7. Multi-Device Testing

1. Open game on desktop
2. Open same game on mobile/tablet
3. Verify:
   - Both see waiting room
   - Teams can join from either device
   - State syncs across devices

## Debug Commands

Open browser console and check:
```javascript
// Check current user
localStorage.getItem('currentUser')

// Check current team
localStorage.getItem('currentTeam')

// Check game state
localStorage.getItem('game_state_taboo_...')

// Check teams
localStorage.getItem('teams')
```

## Expected Behavior

1. **First Load**: Always shows waiting room
2. **Team Joins**: Updates in real-time (2 second refresh)
3. **Countdown**: Auto-starts if no teams join
4. **Manual Start**: Can start early if enough players
5. **Game Discovery**: Shows other games waiting for players

## Next Steps After Testing

If everything works:
- Apply waiting room to other games (Jeopardy, DrawGuess, etc.)
- Add more features (chat, ready status, etc.)
- Improve UI/UX based on feedback

If issues found:
- Check console errors
- Verify API connections
- Test with Supabase enabled/disabled
- Check team activity tracking

