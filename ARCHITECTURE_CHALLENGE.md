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

#### Hierarchy State and Node Relocation Flow

```mermaid
flowchart TD
    A[User] --> B[Hierarchy Page]

    subgraph UI
        B --> C[Tree Panel]
        B --> D[Node Details Panel]
        B --> E[Create Node Modal]
        B --> F[Move Node Modal]
        B --> G[Delete Confirmation Modal]
        B --> H[Notification Area]

        C --> I[Tree View]
        I --> J[Tree Node]
    end

    subgraph Client_State
        K[Centralized Hierarchy State]
        L[Normalized Nodes]
        M[Expanded Node IDs]
        N[Selected Node ID]
        O[Mutation Status]
    end

    subgraph Interaction_Flow
        P[Drag Handle]
        Q[Valid Drop Target Highlight]
        R[Pending Move State]
    end

    subgraph Backend
        S[REST API]
    end

    J --> K
    D --> K
    E --> K
    F --> K
    G --> K

    K --> L
    K --> M
    K --> N
    K --> O

    J --> P
    P --> Q
    Q --> R
    R --> S
    S --> K

    O --> H
```

**Your explanation:**

1. Decision drivers

The frontend architecture is driven by the need to render and manipulate hierarchical data in a way that is clear, responsive, and consistent with backend-enforced rules. The most important UI operation is node relocation, since moving a node changes the structure itself and requires the frontend to communicate intent, prevent obvious invalid actions, and handle backend validation failures gracefully. The design must also support common hierarchy interactions such as expansion and collapse, node selection, subtree inspection, and CRUD actions without losing user context. Because structural mutations can affect multiple visible branches, the frontend needs a state model that can update the hierarchy predictably after create, delete, and move operations while preserving expansion and selection state. Additional drivers include rendering efficiency for larger trees, synchronization with backend validation rules such as allowed parent-child relationships, and overall maintainability for a small team.

2. Options considered

Several frontend approaches were considered across rendering, state management, and relocation interaction. A server-driven or page-oriented frontend would reduce client complexity, but it is poorly suited for a hierarchy editor because structural changes require preserving context, expansion state, and partial refresh of the tree. A client-side application with a structured component hierarchy is a better fit because it supports interactive browsing, focused node editing, and responsive updates after mutations. For state management, relying only on local component state is simple initially, but becomes fragile when move operations affect multiple branches and shared UI concerns such as selection, expansion, and mutation status. A centralized client-side state model with normalized node data offers better coordination and clearer mutation handling. For relocation, drag-and-drop provides the most natural interaction for manipulating a tree, but it should be paired with a form-based or action-based move flow so that the interface remains accessible and can support explicit validation when needed. Overall, the strongest candidate is a client-side tree editor with centralized hierarchy state and a relocation model that supports both drag-and-drop and explicit move actions.

3. Recommended approach

The frontend should be implemented as a React and TypeScript client application with a component structure centered on a tree view, node detail forms, and dedicated modal flows for structural actions. React is a strong fit because the interface naturally decomposes into reusable components such as tree nodes, action menus, forms, and relocation dialogs, while TypeScript improves safety for node types, mutation payloads, and validation states. The hierarchy should be managed through a centralized client-side state model using normalized node data, with global ownership of the tree structure, selected node, expanded nodes, and mutation status, while purely local concerns such as modal visibility and temporary form values remain inside components.

The recommended component structure includes a hierarchy page, a tree panel, a tree view with reusable tree node components, a node details panel for editing, and separate modal components for create, move, and delete actions. This keeps browsing, editing, and structural mutations clearly separated. Drag-and-drop should be implemented as a guided relocation flow with explicit drag handles, visual highlighting of valid targets, and prevention of obviously invalid local moves such as dropping onto the same node or one of its descendants. However, the backend remains authoritative, so the frontend must still handle rejected relocation requests gracefully.

For synchronization, the tree should be stored in normalized form rather than as a single nested object, allowing source and target branches to be updated predictably after mutations. The recommended strategy is to use limited optimistic behavior: non-structural edits may update immediately, but structural mutations such as node relocation should wait for server confirmation before committing the visible tree change. During that time, the UI should show pending feedback on the affected node or branch. This approach provides the best balance between responsiveness, correctness, and maintainability for a hierarchy editor.

#### Frontend Flow for Server-Confirmed Node Move

```mermaid
sequenceDiagram
    participant U as User
    participant TV as Tree View
    participant S as Client State
    participant API as REST API
    participant UI as Notification Area

    U->>TV: Drag node to new parent
    TV->>S: Mark pending move
    TV->>TV: Highlight valid target
    TV->>API: POST /nodes/:id/move
    API-->>S: Move confirmed
    S-->>TV: Update normalized tree state
    S-->>UI: Show success feedback

    alt Move rejected
        API-->>S: Validation error
        S-->>TV: Keep previous structure
        S-->>UI: Show error feedback
    end
```

4. Tradeoffs

The recommended frontend architecture prioritizes predictable handling of hierarchy mutations, clear interaction boundaries, and maintainable state management, but it does so at the cost of higher client-side complexity. A React and TypeScript application with centralized normalized tree state provides a strong foundation for coordinating create, update, delete, and move operations, especially when a structural change affects multiple visible branches. It also allows the interface to separate navigation, node editing, and relocation into explicit components and flows, which improves clarity and testability. Drag-and-drop further improves usability by making structural changes direct and visible, while an explicit move dialog provides a safer and more accessible fallback.

The main tradeoff is that this design is more complex than a simpler page-oriented or fully local-state implementation. It requires careful state boundaries, mutation lifecycle handling, and controlled synchronization with backend responses. In addition, the recommendation to wait for server confirmation before committing structural moves favors correctness and simpler error handling over maximum immediacy in the interface. Drag-and-drop also adds implementation and accessibility complexity, which is why it should not be the only relocation mechanism. These tradeoffs are acceptable because the interface must support a mutable hierarchy reliably, and the chosen architecture provides a better long-term balance of usability, correctness, and maintainability than a simpler but less controlled frontend design.

---

### 2. Backend Architecture

Consider:
- API design (REST, GraphQL, etc.) and endpoint/operation structure for each CRUD action
- How relocating a node is handled (cycle prevention, subtree integrity)
- Database choice and how the tree is stored (adjacency list, nested sets, materialized path, etc.)
- Validation rules (e.g., a Component can only be a child of an Asset or Location)

#### Backend Architecture Overview

```mermaid
flowchart TD
    A[Client] --> B[REST API]
    B --> C[Node Controller]
    C --> D[Node Service]

    D --> E[Structural Validation]
    D --> F[Domain Validation]
    D --> G[Transaction]
    G --> H[Node Repository]
    H --> I[(Relational Database)]

    D --> J[Hierarchy Query Logic]
    J --> H

    C --> K[CRUD Endpoints]
    C --> L[Move Endpoint]

    I --> M[Nodes: id, type, parent_id, position, version]
```

**Your explanation:**

1. Decision drivers

The backend must provide a reliable model for hierarchical data with emphasis on correctness during structural mutations. The central operation is moving a node or subtree within the tree, which introduces constraints around atomicity, cycle prevention, parent validation, and concurrent modification handling. The persistence and API design should support the main read patterns efficiently, especially subtree retrieval, ancestor reconstruction, and partial refresh after a move. Because the solution is expected to be maintainable by a small team, the architecture should prioritize clear domain semantics, testable invariants, and moderate operational complexity rather than overly specialized optimizations.

2. Options considered

Several hierarchy persistence models were considered. An adjacency list stores only the direct parent reference and offers the simplest write model, especially for create and move operations, but requires recursive traversal for subtree and ancestor queries. Materialized path stores the ancestry path on each node, which simplifies subtree and path queries, but makes subtree moves more expensive because descendant paths must be rewritten. Nested sets support efficient read-heavy hierarchical queries, but are poorly suited for frequent structural mutations due to costly index recalculation. Closure table stores ancestor-descendant relationships explicitly and provides flexible hierarchy queries, but increases schema complexity, write complexity, and operational overhead. Given that subtree relocation is a central domain operation and maintainability is an important constraint, the strongest candidates are adjacency list and materialized path, with nested sets and closure table being less attractive for an initial implementation.

3. Recommended approach

The backend should be implemented as a REST API backed by a relational database, with the hierarchy stored using an adjacency list model. Each node is persisted with a `parent_id` reference to its direct parent, which keeps the data model simple and well aligned with the domain. Standard CRUD actions should be exposed through regular endpoints for creating, retrieving, updating, and deleting nodes, while hierarchy-specific reads such as children, subtree, and ancestors should be exposed through dedicated read endpoints. Node relocation should not be treated as a generic update; instead, it should be modeled as an explicit operation such as `POST /nodes/{id}/move`, since relocating a node requires specialized validation and transactional handling.

This approach directly addresses the challenge requirements. For API design, it provides a clear REST structure for CRUD actions and hierarchy operations. For relocation, it ensures that moving a node is validated and executed atomically, including prevention of cycles, rejection of self-parenting, validation of the target parent, and preservation of subtree integrity. For persistence, a relational database with adjacency list storage is recommended because it provides strong consistency and avoids the higher mutation complexity of models such as nested sets or materialized path. For validation, the backend enforces both structural rules and business rules, including constraints such as allowing a Component to exist only under an Asset or Location. Overall, this design offers the best balance of correctness, clarity, and maintainability.

#### Transactional Flow for Node Relocation

```mermaid
sequenceDiagram
    participant U as Client
    participant API as REST API
    participant S as Node Service
    participant V as Validation
    participant R as Repository
    participant DB as Relational DB

    U->>API: POST /nodes/{id}/move
    API->>S: moveNode(nodeId, newParentId, position)

    S->>R: load node
    R->>DB: SELECT node
    DB-->>R: node
    R-->>S: node

    S->>R: load target parent
    R->>DB: SELECT target parent
    DB-->>R: target parent
    R-->>S: target parent

    S->>V: validate structural rules
    V-->>S: no self-parent / no cycle / valid parent

    S->>V: validate domain rules
    V-->>S: allowed parent-child types

    S->>DB: BEGIN TRANSACTION
    S->>R: update parent_id and position
    R->>DB: UPDATE nodes
    DB-->>R: updated
    R-->>S: success
    S->>DB: COMMIT

    S-->>API: updated node + affected branches
    API-->>U: 200 OK
```

4. Tradeoffs

The recommended backend architecture prioritizes correctness, maintainability, and explicit domain behavior, but it does so by accepting some read-side complexity. Using a relational database with adjacency list storage keeps structural writes simple and makes operations such as node relocation easier to validate and execute safely inside a transaction. This is a strong fit because cycle prevention, subtree integrity, and domain-specific parent-child validation can all be enforced in a dedicated backend operation rather than hidden inside generic update logic. The API also becomes clearer, since standard CRUD actions remain simple while hierarchy-specific operations such as subtree retrieval and node movement are modeled explicitly.

The main tradeoff is that adjacency list is less efficient for certain hierarchical reads, especially subtree traversal and ancestor reconstruction, which require recursive queries or equivalent backend traversal logic. This means the architecture gives up some read performance and query convenience compared with models such as materialized path or closure table. It also places more responsibility on the application layer to enforce tree invariants and type-based validation rules. In addition, choosing REST over GraphQL favors operational clarity and explicit commands over flexible client-driven querying. These tradeoffs are acceptable because the primary requirement is safe, understandable handling of hierarchy mutations rather than maximum optimization for complex read patterns.

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
