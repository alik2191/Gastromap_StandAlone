# 🤖 AI AGENTS GUIDE - Gastromap V2

**Last Updated:** 2026-03-31  
**Author:** Gas AI - Code Quality Agent

---

## 🎯 OVERVIEW

Gastromap V2 uses multiple AI agents for automated quality assurance, monitoring, and optimization.

---

## 👥 AVAILABLE AGENTS

### 1. Code Quality Agent ✅

**Purpose:** Analyze code structure and enforce best practices

**Capabilities:**
- ✅ Code structure analysis
- ✅ Dependency auditing
- ✅ Best practices validation
- ✅ Technical debt tracking
- ✅ Code smell detection

**How to Run:**
```bash
# Manual audit
cd /tmp/Gastromap_StandAlone

# Check file structure
find src -type f \( -name "*.js" -o -name "*.jsx" \) | wc -l

# Find TODO/FIXME
grep -r "// TODO\|// FIXME" src/ --include="*.js"

# Find console.log
grep -r "console\.log" src/ --include="*.js" | wc -l

# Find large files
find src -type f -exec wc -l {} \; | awk '$1 > 500'
```

**Output:** Code quality report with metrics

---

### 2. Testing Agent ✅

**Purpose:** Run tests and identify failures

**Capabilities:**
- ✅ Execute test suites
- ✅ Identify failing tests
- ✅ Debug test issues
- ✅ Fix i18n mismatches
- ✅ Stabilize flaky tests

**How to Run:**
```bash
# Run all tests
npm run test -- --run

# Run specific test
npm run test -- src/features/auth/Auth.test.jsx

# Watch mode
npm run test -- --watch

# With coverage (future)
npm run test -- --coverage
```

**Output:** Test results with pass/fail status

---

### 3. Optimization Agent ✅

**Purpose:** Optimize code and improve performance

**Capabilities:**
- ✅ Bundle size analysis
- ✅ Performance profiling
- ✅ Code splitting recommendations
- ✅ Lazy loading implementation
- ✅ Caching strategies

**How to Run:**
```bash
# Build with analysis
npm run build -- --mode analyze

# Performance audit (Lighthouse)
npm run lighthouse

# Check bundle size
npm run build && ls -lh dist/assets/
```

**Output:** Optimization recommendations

---

### 4. Security Agent ⏳ (Future)

**Purpose:** Security auditing and vulnerability detection

**Capabilities:**
- 🔜 Dependency vulnerability scanning
- 🔜 RLS policy validation
- 🔜 JWT token auditing
- 🔜 CORS configuration review
- 🔜 Rate limiting checks

**How to Run (Future):**
```bash
npm audit
npm run security-check
```

---

### 5. Performance Agent ⏳ (Future)

**Purpose:** Monitor and optimize runtime performance

**Capabilities:**
- 🔜 Core Web Vitals monitoring
- 🔜 API response time tracking
- 🔜 Database query optimization
- 🔜 Cache hit rate analysis
- 🔜 Memory leak detection

**How to Run (Future):**
```bash
npm run perf-test
npm run lighthouse:ci
```

---

## 📊 AGENT WORKFLOW

```
┌─────────────────┐
│  Code Commit    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Code Quality    │
│ Agent           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Testing Agent   │
└────────┬────────┘
         │
         ▼
    ┌────┴────┐
    │  Pass?  │
    └────┬────┘
         │
    ┌────┴────┐
    │         │
   Yes       No
    │         │
    ▼         ▼
┌──────┐  ┌─────────┐
│Push  │  │ Fix &   │
│to GH │  │ Retry   │
└──────┘  └─────────┘
```

---

## 🔧 AUTOMATED WORKFLOWS

### Daily AI Research (Active ✅)

**Schedule:** Every day at 9:00 AM UTC

**Task:** Research AI/LLM trends and save to database

**Function:**
```javascript
// Research new AI models
// Analyze pricing changes
// Save insights to AiResearch entity
// Send summary to Telegram
```

**Credits:** ~1.1 per run

---

### Code Quality Check (Future ⏳)

**Schedule:** Every PR

**Task:** Run code quality audit

**Function:**
```javascript
// Check code structure
// Validate imports
// Find TODO/FIXME
// Report issues
```

---

### Test Runner (Future ⏳)

**Schedule:** Every commit

**Task:** Run all tests

**Function:**
```javascript
// Execute test suite
// Report pass/fail
// Upload coverage
// Block on failures
```

---

## 📈 AGENT METRICS

### Current Status

| Agent | Status | Last Run | Duration | Credits |
|-------|--------|----------|----------|---------|
| Code Quality | ✅ Active | 2026-03-31 | ~5 min | ~0.5 |
| Testing | ✅ Active | 2026-03-31 | ~10s | ~0.1 |
| Optimization | ✅ Active | 2026-03-31 | ~3 min | ~0.3 |
| Daily Research | ✅ Active | Daily | ~2 min | ~1.1 |
| Security | ⏳ Pending | - | - | - |
| Performance | ⏳ Pending | - | - | - |

### Monthly Budget

| Agent | Estimated Credits/Month |
|-------|------------------------|
| Daily Research | 33 |
| Code Quality (per PR) | 15 |
| Testing (per commit) | 10 |
| **TOTAL** | **~58** |

**Available:** 500 credits/month  
**Utilization:** ~12%

---

## 🚨 TROUBLESHOOTING

### Agent Not Running

**Symptoms:**
- No output in logs
- Task not executing

**Solution:**
```bash
# Check automation status
# Verify credentials
# Review error logs
```

### High Credit Usage

**Symptoms:**
- Credits depleting fast
- Unexpected charges

**Solution:**
```bash
# Reduce frequency
# Optimize prompts
# Cache results
# Use cheaper models
```

### Test Failures

**Symptoms:**
- Tests failing consistently
- Flaky behavior

**Solution:**
```bash
# Check i18n consistency
# Fix mock data
# Update selectors
# Stabilize async waits
```

---

## 📚 BEST PRACTICES

### For Agents

1. **Be Specific:** Clear, focused tasks
2. **Cache Results:** Avoid redundant API calls
3. **Use Free Models:** When possible
4. **Log Everything:** Debugging is easier
5. **Fail Gracefully:** Handle errors properly

### For Humans

1. **Review Agent Output:** Don't blindly trust
2. **Provide Context:** More info = better results
3. **Set Expectations:** Define success criteria
4. **Monitor Usage:** Keep track of credits
5. **Give Feedback:** Help agents improve

---

## 🔮 FUTURE AGENTS

### Planned for Q2 2026

- **Documentation Agent:** Auto-generate docs
- **Deployment Agent:** Automated deployments
- **Monitoring Agent:** Real-time alerts
- **Backup Agent:** Database backups

### Planned for Q3 2026

- **Refactoring Agent:** Code improvements
- **Feature Agent:** Generate new features
- **Bug Hunter:** Find and fix bugs
- **Performance Agent:** Optimize speed

---

## 📞 SUPPORT

### Agent Issues

1. Check agent logs
2. Review task configuration
3. Verify credentials
4. Create GitHub Issue

### Credit Concerns

1. Review usage dashboard
2. Optimize agent frequency
3. Switch to cheaper models
4. Contact support

---

**Maintained by:** Gas AI - Head Agent  
**Last Review:** 2026-03-31  
**Next Review:** 2026-04-15
