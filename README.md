# Asset Tree Challenge — TypeScript

## The Challenge

Build a hierarchical tree from three flat arrays — `Location[]`, `Asset[]`, `Component[]` — and expose efficient operations on it.

Implement the methods in `candidate/assetTree.ts`. Do not modify any other file.

### Methods

| Method | Required |
|---|---|
| `buildTree(): TreeNode` | Yes |
| `findNodeById(nodeId: string): TreeNode \| undefined` | Yes |
| `getPath(nodeId: string): TreeNode[]` | Yes |
| `filterTree(criteria: FilterCriteria): TreeNode \| undefined` | Bonus |
| `addNode(node): [TreeNode \| undefined, Error \| undefined]` | Bonus |
| `removeNode(nodeId: string): boolean` | Bonus |
| `moveNode(nodeId: string, newParentId: string): boolean` | Bonus |

All types are defined in `candidate/types.ts`.

### Repository Structure

**Your repo must keep this exact directory layout.** Our automated evaluation looks for your solution at `candidate/assetTree.ts` from the repo root. If the file is not at that path, evaluation will fail.

```
your-repo/              ← this is the root of your GitHub repository
├── candidate/
│   ├── types.ts        ← do NOT modify
│   ├── assetTree.ts    ← implement your solution HERE
│   └── _template/      ← pristine stub for resetting
├── examples/
│   └── basic.test.ts   ← example tests
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── ARCHITECTURE_CHALLENGE.md
└── README.md
```

Push this entire structure to your repo — do **not** move files to the root or reorganize folders.

### Running the example tests

```bash
npm install
npm test
```

### Submitting

1. Push your solution to a **private** GitHub repository
2. Add `tractian-tech-fast-track-bot` as a collaborator on your repo
3. We'll receive your submission automatically

### Tips

- Focus on correctness first, then performance
- Think about time complexity — O(n²) solutions may time out on large inputs
- The example tests are minimal; we run a much larger hidden test suite
- Optional methods are bonus — implement them if you have time

### Reset

```bash
cp candidate/_template/assetTree.ts candidate/assetTree.ts
```

---

## Architecture Challenge

In addition to the coding exercise above, you must complete the architecture challenge described in **`ARCHITECTURE_CHALLENGE.md`**. Open that file and fill in all three sections (Frontend, Backend, Infrastructure) with text-based diagrams (Mermaid preferred) and written explanations. This part is manually reviewed.
