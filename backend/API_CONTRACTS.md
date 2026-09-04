# Skill Match Backend — API Contracts (Dev 3/Dev 4 Integration)

## Base URL
```
http://localhost:3001/api
```

## Authentication
All endpoints except `/roles` and `/matching/opportunities` require a Bearer token:
```
Authorization: Bearer <jwt_token>
```

## Standard Response Format
```json
{
  "success": true,
  "data": { ... },
  "error": { "code": "ERROR_CODE", "message": "Human-readable message" }
}
```

---

## 1. RESUME

### POST /api/resume/upload
Upload and parse a resume. Extracts skills automatically.

**Auth:** Required
**Content-Type:** multipart/form-data

**Request:**
- `resume` (file): PDF or text file, max 5MB

**Response (201):**
```json
{
  "success": true,
  "data": { "resume_id": "clxyz..." }
}
```

### GET /api/resume/my
Get all resumes for the authenticated user.

**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxyz...",
      "fileName": "resume.pdf",
      "fileUrl": "/uploads/resume.pdf",
      "fileSize": 102400,
      "mimeType": "application/pdf",
      "parsedText": "...",
      "extractedSkills": [
        {
          "id": "...",
          "skillId": "...",
          "proficiency": "BEGINNER",
          "confidence": 0.8,
          "skill": { "id": "...", "name": "Python", "category": "PROGRAMMING" }
        }
      ],
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### GET /api/resume/:id
Get a specific resume by ID.

**Auth:** Required

### GET /api/resume/:id/skills
Get extracted skills for a resume.

**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Python",
      "normalizedName": "python",
      "category": "PROGRAMMING",
      "proficiency": "BEGINNER",
      "confidence": 0.85,
      "context": "Python programming experience..."
    }
  ]
}
```

### DELETE /api/resume/:id
Delete a resume.

**Auth:** Required

---

## 2. SKILL GAP RADAR

### POST /api/skill-gap/analyze
Analyze skill gaps between a resume and a target role.

**Auth:** Required

**Request:**
```json
{
  "resume_id": "clxyz...",
  "target_role": "Data Scientist",
  "role_id": "optional_role_id"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "target_role": "Data Scientist",
    "existing_skills": [
      { "id": "...", "name": "Python", "category": "PROGRAMMING", "proficiency": "INTERMEDIATE" }
    ],
    "missing_skills": [
      { "id": "...", "name": "Deep Learning", "category": "AI_ML", "proficiency": "ADVANCED" }
    ],
    "weak_skills": [
      { "id": "...", "name": "SQL", "category": "DATABASE", "proficiency": "INTERMEDIATE" }
    ],
    "priority_skills": [
      { "id": "...", "name": "Deep Learning", "category": "AI_ML", "proficiency": "ADVANCED" }
    ],
    "coverage_score": 45,
    "recommendations": [
      "Focus on learning: Deep Learning, TensorFlow, PyTorch",
      "Strengthen these skills: SQL",
      "3 high-priority skills need attention"
    ]
  }
}
```

### GET /api/skill-gap/history
Get skill gap analysis history for the user.

**Auth:** Required

### POST /api/skill-gap/compare
Compare resume against multiple roles.

**Auth:** Required

**Request:**
```json
{
  "resume_id": "clxyz...",
  "role_ids": ["role1", "role2", "role3"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "target_role": "Data Scientist", "coverage_score": 45, ... },
    { "target_role": "Backend Developer", "coverage_score": 72, ... }
  ]
}
```

---

## 3. RESUME MATCHING

### POST /api/matching/match
Match a resume against an opportunity.

**Auth:** Required

**Request:**
```json
{
  "resume_id": "clxyz...",
  "opportunity_id": "clxyz..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "match_id": "...",
    "match_score": 82,
    "matching_skills": [
      { "id": "...", "name": "Python", "category": "PROGRAMMING", "proficiency": "ADVANCED" }
    ],
    "missing_skills": [
      { "name": "Kubernetes", "category": "DEVOPS", "proficiency": "INTERMEDIATE" }
    ],
    "experience_match": {
      "score": 82,
      "details": ["Matched 8 skills", "Missing 2 required skills"]
    },
    "recommendation": "Strong match. You are well-qualified for this role.",
    "opportunity": {
      "id": "...",
      "title": "Backend Developer Intern",
      "company": "TechCorp",
      "location": "Bangalore",
      "type": "INTERNSHIP"
    }
  }
}
```

### GET /api/matching/my-matches
Get all match results for the user.

**Auth:** Required

### GET /api/matching/best-opportunities?resume_id=xxx&limit=10
Find best matching opportunities for a resume.

**Auth:** Required

### GET /api/matching/opportunities?type=INTERNSHIP&category=Tech&search=python&page=1&limit=20
List available opportunities (public).

### GET /api/matching/opportunities/:id
Get a specific opportunity (public).

---

## 4. SKILL GRAPH

### GET /api/skill-graph?role_id=xxx&user_id=optional
Get skill graph data for visualization.

**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "role-xxx",
        "type": "role",
        "label": "Data Scientist",
        "data": { "description": "...", "category": "Data Science" }
      },
      {
        "id": "skill-xxx",
        "type": "skill",
        "label": "Python",
        "data": { "category": "PROGRAMMING", "requiredProficiency": "ADVANCED", "weight": 2.0, "isRequired": true },
        "metadata": { "proficiency": "INTERMEDIATE", "isMissing": false, "isWeak": true, "priority": 2.0 }
      }
    ],
    "edges": [
      {
        "id": "edge-role-skill1",
        "source": "role-xxx",
        "target": "skill-xxx",
        "type": "requires",
        "weight": 2.0,
        "label": "required"
      }
    ]
  }
}
```

**Node types:** `role`, `skill`, `project`, `technology`, `certification`
**Edge types:** `requires`, `related_to`, `depends_on`, `demonstrated_by`, `missing_for`

### POST /api/skill-graph/generate
Force regenerate a skill graph.

**Auth:** Required

**Request:**
```json
{
  "role_id": "clxyz...",
  "user_id": "optional_user_id"
}
```

---

## 5. INTERNSHIP TIMETABLE PLANNER

### POST /api/planner/generate
Generate a personalized preparation schedule.

**Auth:** Required

**Request:**
```json
{
  "target_role": "Backend Developer",
  "role_id": "optional_role_id",
  "available_days": 30,
  "hours_per_day": 3,
  "start_date": "2026-09-01",
  "priorities": ["FastAPI", "Docker"],
  "include_interview_prep": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "title": "Backend Developer Preparation Plan",
    "description": "Personalized 30-day preparation plan for Backend Developer",
    "total_days": 30,
    "hours_per_day": 3,
    "start_date": "2026-09-01",
    "end_date": "2026-09-30",
    "schedule": [
      {
        "day": 1,
        "date": "2026-09-01",
        "topics": [
          {
            "id": "uuid",
            "title": "Fundamentals Review",
            "description": "Review core fundamentals",
            "type": "fundamentals",
            "estimated_hours": 1.5
          }
        ],
        "total_hours": 3
      }
    ],
    "metadata": {
      "target_role": "Backend Developer",
      "role_id": "...",
      "missing_skills_count": 5
    }
  }
}
```

**Topic types:** `fundamentals`, `skill`, `practice`, `project`, `revision`, `interview_prep`

### GET /api/planner/my
Get user's schedules.

**Auth:** Required

### GET /api/planner/:id
Get a specific schedule.

**Auth:** Required

### POST /api/planner/progress
Update schedule progress.

**Auth:** Required

**Request:**
```json
{
  "schedule_id": "clxyz...",
  "day": 1,
  "topic_id": "uuid",
  "completed": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { "progress": 3.33, "totalTopics": 30, "completedTopics": 1 }
}
```

---

## 6. AI HR / INTERVIEW TRAINING

### POST /api/interview/start
Start a new interview session.

**Auth:** Required

**Request:**
```json
{
  "role_id": "optional_role_id",
  "stage": "HR_INTERVIEW",
  "difficulty": "medium",
  "num_questions": 5
}
```

**Stages:** `HR_INTERVIEW`, `TECHNICAL_INTERVIEW`, `BEHAVIORAL_INTERVIEW`
**Difficulties:** `easy`, `medium`, `hard`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "session_id": "clxyz...",
    "current_stage": "HR_INTERVIEW",
    "current_question_index": 0,
    "questions": [
      {
        "id": "q1",
        "stage": "HR_INTERVIEW",
        "question": "Tell me about yourself and your background.",
        "expected_topics": [],
        "difficulty": "medium",
        "follow_up_questions": []
      }
    ],
    "evaluations": [],
    "total_score": 0,
    "feedback": "",
    "status": "in_progress"
  }
}
```

### POST /api/interview/evaluate
Evaluate an answer and get the next question.

**Auth:** Required

**Request:**
```json
{
  "session_id": "clxyz...",
  "question_id": "q1",
  "answer": "I am a software engineer with 3 years of experience..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "evaluation": {
      "question_id": "q1",
      "answer": "...",
      "score": 75,
      "strengths": ["Detailed response", "Good examples"],
      "weaknesses": ["Could be more concise"],
      "feedback": "Good response with solid examples...",
      "technical_correctness": 70,
      "communication": 80,
      "clarity": 75,
      "relevance": 85,
      "problem_solving": 65,
      "completeness": 70
    },
    "next_question": {
      "id": "q2",
      "question": "Why are you interested in this position?",
      ...
    },
    "session_complete": false,
    "current_score": 75
  }
}
```

### GET /api/interview/my
Get user's interview sessions.

**Auth:** Required

### GET /api/interview/:id
Get a specific interview session.

**Auth:** Required

### POST /api/interview/:id/abandon
Abandon an interview session.

**Auth:** Required

---

## 7. ROLES & SKILLS (Reference Data)

### GET /api/roles
List all roles with their required skills.

### GET /api/roles/:id
Get a specific role with required skills.

### GET /api/roles/skills?category=PROGRAMMING&search=python
List all available skills.

---

## 8. DEV 1 INTEGRATION INTERFACES

Your implementation expects the following from Dev 1:

### Opportunity Service Interface
Dev 1 should expose:
- `GET /api/opportunities` — List opportunities (already implemented above)
- `GET /api/opportunities/:id` — Get opportunity details
- Opportunity objects should include: `requiredSkills` (JSON string array), `preferredSkills` (JSON string array), `companyProfile`

### Data Format Contract
Opportunity `requiredSkills` and `preferredSkills` must be JSON arrays:
```json
["Python", "Docker", "REST API"]
```
Or objects:
```json
[{ "skill": "Python", "required": true }]
```

---

## ERROR RESPONSES

All errors follow:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "resume_id and target_role are required"
  }
}
```

**Common error codes:**
- `NOT_FOUND` — Resource not found
- `VALIDATION_ERROR` — Invalid input
- `UNAUTHORIZED` — Missing/invalid token
- `FORBIDDEN` — Insufficient permissions
- `SESSION_INACTIVE` — Interview session not in progress
- `ROLE_NOT_FOUND` — Target role not in database
- `NO_ROLE_SKILLS` — Role has no skills defined
- `INVALID_FILE_TYPE` — Unsupported resume format
- `EMPTY_RESUME` — Could not extract text from resume
