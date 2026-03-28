# Architecture Challenge

## Overview

Design the architecture for a **web application that manages the asset tree** you built in the coding challenge. The application should let users visualize the tree and perform CRUD operations on its nodes (Locations, Assets, and Components) — including creating, editing, relocating, and deleting nodes.

Document your architecture in this file using **text-based diagrams** (Mermaid, ASCII, or any text-renderable format — no images).

---

## Functional Requirements

1. **Tree visualization** — display the full hierarchy of Locations, Assets, and Components as an interactive tree.
2. **Create node** — add a new Location, Asset, or Component under a selected parent node.
3. **Edit node** — update the properties of an existing node (name, sensor type, status, etc.).
4. **Relocate node** — move a node (and its subtree) to a different parent via drag-and-drop or explicit action.
5. **Delete node** — remove a node and its entire subtree, with a confirmation step.

---

## What You Must Deliver

Design and document the following **three layers** in the sections below. Use **Mermaid diagrams** (preferred) or ASCII diagrams — no images.

### 1. Frontend Architecture

Consider:
- Framework/library choices and why
- Component structure (tree view, forms, modals, etc.)
- State management — how the tree state is kept in sync after mutations
- How drag-and-drop relocation works
- Optimistic updates vs. waiting for server confirmation

```mermaid
%% Replace this block with your frontend architecture diagram
```

**Your explanation:**

<!-- Write your reasoning here -->

---

### 2. Backend Architecture

Consider:
- API design (REST, GraphQL, etc.) and endpoint/operation structure for each CRUD action
- How relocating a node is handled (cycle prevention, subtree integrity)
- Database choice and how the tree is stored (adjacency list, nested sets, materialized path, etc.)
- Validation rules (e.g., a Component can only be a child of an Asset or Location)

```mermaid
%% Replace this block with your backend architecture diagram
```

**Your explanation:**

<!-- Write your reasoning here -->

---

### 3. Infrastructure Architecture

Consider:
- How the application is deployed (cloud services, containers, serverless, etc.)
- CI/CD pipeline overview
- Observability: logging, metrics, alerting
- How the system scales if the tree grows to hundreds of thousands of nodes

```mermaid
%% Replace this block with your infrastructure architecture diagram
```

**Your explanation:**

<!-- Write your reasoning here -->

---

## Evaluation Criteria

This exercise is **manually reviewed**. There is no single correct answer. We are looking for:

| Criteria | What we look for |
|---|---|
| **Clarity** | Can we understand your architecture quickly? Are the diagrams readable? |
| **Reasoning** | Do you justify your choices? Trade-offs matter more than picking the "right" tool. |
| **Completeness** | Are all three layers addressed? Are the connections between them clear? |
| **Practicality** | Does this feel like something a small team could build and maintain? Over-engineering is a negative signal. |

## Tips

- **Trade-offs > buzzwords.** Explain *why* you chose something, not just *what*.
- **Keep it buildable.** Design something a team of 4-6 engineers could realistically ship.
- **Mermaid reference:** [mermaid.js.org](https://mermaid.js.org/) — GitHub renders Mermaid blocks natively in markdown files.
