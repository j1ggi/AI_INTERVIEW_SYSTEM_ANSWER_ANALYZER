export const FALLBACK_QUESTION_BANK = [
  // --- Data Structures & Algorithms ---
  {
    topic: 'Data Structures & Algorithms',
    difficulty: 'Easy',
    type: 'Technical',
    questionText: 'Explain how two-pointer algorithms optimize search problems in sorted arrays compared to a brute-force nested loop.',
    referenceConcepts: ['O(n) time complexity', 'Sorted array invariant', 'Left/right pointer convergence', 'O(1) auxiliary space'],
    evaluationCriteria: [
      'Contrasts O(n) two-pointer with O(n^2) brute-force',
      'Explains why array must be sorted',
      'Provides practical examples like Two Sum II or Container With Most Water',
    ],
  },
  {
    topic: 'Data Structures & Algorithms',
    difficulty: 'Medium',
    type: 'Technical',
    questionText: 'Explain how internal hash collisions are resolved in modern HashMaps. Why and when does a bucket convert from a LinkedList to a balanced Binary Search Tree?',
    referenceConcepts: ['Chaining', 'Load Factor (0.75)', 'TREEIFY_THRESHOLD (8)', 'Red-Black Tree O(log n)', 'Hash distribution'],
    evaluationCriteria: [
      'Accurate description of collision chaining',
      'Mentions treeification threshold (typically 8 entries)',
      'Explains worst-case lookup improvement from O(n) to O(log n)',
    ],
  },
  {
    topic: 'Data Structures & Algorithms',
    difficulty: 'Hard',
    type: 'Technical',
    questionText: 'How would you detect cycles in a directed graph versus an undirected graph? Explain the difference in DFS coloring (White/Gray/Black) versus Union-Find.',
    referenceConcepts: ['Three-color DFS', 'Back-edges', 'Union-Find / Disjoint Set Union', 'Topological Sort / Kahn Algorithm', 'Directed Acyclic Graph'],
    evaluationCriteria: [
      'Explains why simple visited set is insufficient for directed graphs',
      'Correctly details the 3-state coloring mechanism (unvisited, visiting, visited)',
      'Clarifies when Union-Find can and cannot be used for directed cycles',
    ],
  },

  // --- Database Management Systems ---
  {
    topic: 'Database Management Systems',
    difficulty: 'Easy',
    type: 'Technical',
    questionText: 'What are the ACID properties in relational database management systems, and why is each property critical for data integrity?',
    referenceConcepts: ['Atomicity (all-or-nothing)', 'Consistency (valid state)', 'Isolation (concurrency)', 'Durability (persistence / WAL)'],
    evaluationCriteria: [
      'Accurately defines all 4 ACID properties',
      'Explains rollback mechanism for Atomicity',
      'Mentions Write-Ahead Logging (WAL) or disk sync for Durability',
    ],
  },
  {
    topic: 'Database Management Systems',
    difficulty: 'Medium',
    type: 'Technical',
    questionText: 'Explain the internal architecture of B+ Trees and why relational database engines prefer B+ Trees over traditional Binary Search Trees for disk storage.',
    referenceConcepts: ['B+ Tree node fan-out', 'Sequential leaf node pointers', 'Disk page / block I/O reduction', 'Range query efficiency', 'Tree height'],
    evaluationCriteria: [
      'Identifies high fan-out leading to shallow tree height',
      'Explains sequential linked leaf nodes for fast range scans',
      'Contrasts disk block read size with in-memory pointer overhead',
    ],
  },
  {
    topic: 'Database Management Systems',
    difficulty: 'Hard',
    type: 'Technical',
    questionText: 'Compare the ANSI SQL transaction isolation levels: Read Uncommitted, Read Committed, Repeatable Read, and Serializable. Detail the anomalies each level prevents.',
    referenceConcepts: ['Dirty reads', 'Non-repeatable reads', 'Phantom reads', 'Snapshot isolation', 'Two-Phase Locking (2PL) / MVCC'],
    evaluationCriteria: [
      'Maps each isolation level to the specific anomaly it eliminates',
      'Explains Multi-Version Concurrency Control (MVCC) mechanics',
      'Discusses performance trade-offs between Serializable and Read Committed',
    ],
  },

  // --- Operating Systems ---
  {
    topic: 'Operating Systems',
    difficulty: 'Easy',
    type: 'Technical',
    questionText: 'What is the fundamental difference between a Process and a Thread in modern operating systems? How do they share system memory?',
    referenceConcepts: ['Process Control Block (PCB)', 'Thread Control Block (TCB)', 'Shared heap & data segment', 'Independent stack & registers', 'Context switch overhead'],
    evaluationCriteria: [
      'Clarifies that processes have isolated address spaces while threads share memory',
      'Highlights that threads have private stacks and program counters',
      'Notes lower context-switching cost of threads',
    ],
  },
  {
    topic: 'Operating Systems',
    difficulty: 'Medium',
    type: 'Technical',
    questionText: 'Describe the four necessary conditions for a deadlock to occur in an operating system. How does the Banker\'s Algorithm prevent deadlocks?',
    referenceConcepts: ['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Circular Wait', 'Safe state verification', 'Resource allocation matrix'],
    evaluationCriteria: [
      'Lists all four Coffman deadlock conditions accurately',
      'Explains the concept of safe versus unsafe state',
      'Details how Banker\'s algorithm simulates resource allocation before granting requests',
    ],
  },
  {
    topic: 'Operating Systems',
    difficulty: 'Hard',
    type: 'Technical',
    questionText: 'Explain how virtual memory paging works with Translation Lookaside Buffers (TLBs) and Multi-Level Page Tables. What occurs during a TLB miss versus a Page Fault?',
    referenceConcepts: ['Page Table Walk', 'TLB hit/miss', 'Page Fault interrupt', 'Demand Paging', 'Disk swap space', 'Dirty / Present bits'],
    evaluationCriteria: [
      'Distinguishes between a hardware TLB miss and a software OS page fault',
      'Traces steps of OS servicing a page fault from disk into a physical frame',
      'Explains memory footprint benefits of multi-level page tables',
    ],
  },

  // --- Computer Networks ---
  {
    topic: 'Computer Networks',
    difficulty: 'Easy',
    type: 'Technical',
    questionText: 'Explain the three-way handshake in TCP connection establishment and contrast TCP with UDP in terms of reliability and overhead.',
    referenceConcepts: ['SYN', 'SYN-ACK', 'ACK', 'Sequence numbers', 'Connection-oriented vs connectionless', 'Header overhead (20 vs 8 bytes)'],
    evaluationCriteria: [
      'Accurately explains the 3 steps of SYN, SYN-ACK, ACK',
      'Explains why initial sequence numbers are exchanged',
      'Provides practical examples where UDP is preferred over TCP (DNS, video streaming)',
    ],
  },
  {
    topic: 'Computer Networks',
    difficulty: 'Medium',
    type: 'Technical',
    questionText: 'What happens under the hood when a user types "https://google.com" into a web browser and presses Enter? Trace from DNS resolution to TLS termination.',
    referenceConcepts: ['DNS recursive lookup', 'TCP 3-way handshake', 'TLS 1.3 handshake / certificates', 'HTTP GET request', 'Reverse proxy / CDN caching'],
    evaluationCriteria: [
      'Traces DNS hierarchy (Browser cache -> OS -> Recursive resolver -> Authoritative)',
      'Includes TLS certificate validation and symmetric session key generation',
      'Explains HTTP/2 or HTTP/3 multiplexing and DOM rendering',
    ],
  },

  // --- System Design & Architecture ---
  {
    topic: 'System Design',
    difficulty: 'Medium',
    type: 'Technical',
    questionText: 'Design a scalable URL Shortening service (like Bitly). Explain the hash generation strategy (Base62 vs MD5) and caching layer to handle high read/write ratios.',
    referenceConcepts: ['Base62 encoding', 'Snowflake / distributed counter ID', 'Redis / Memcached cache', 'Database indexing on short_url', '301 vs 302 HTTP redirection'],
    evaluationCriteria: [
      'Calculates scale estimations and read-to-write ratio',
      'Explains collision-free ID generation using auto-increment counters + Base62',
      'Justifies 301 Permanent vs 302 Temporary redirect trade-offs for analytics',
    ],
  },
  {
    topic: 'System Design',
    difficulty: 'Hard',
    type: 'Technical',
    questionText: 'Explain the CAP Theorem and PACELC theorem. How do distributed database systems like Apache Cassandra or Amazon DynamoDB achieve tunable consistency?',
    referenceConcepts: ['Consistency, Availability, Partition Tolerance', 'Eventual consistency', 'Quorum reads/writes (R + W > N)', 'Vector clocks', 'Gossip protocol'],
    evaluationCriteria: [
      'Clarifies why partition tolerance is non-negotiable in distributed networks',
      'Defines the quorum formula R + W > N for strong consistency',
      'Explains PACELC extension for latency vs consistency trade-offs when no partition exists',
    ],
  },

  // --- Object-Oriented Programming ---
  {
    topic: 'Object-Oriented Programming',
    difficulty: 'Easy',
    type: 'Technical',
    questionText: 'What is inheritance in OOP? Explain how it promotes code reusability and how parent and child classes interact.',
    referenceConcepts: [
      'Subclassing and code reuse (extends keyword)',
      'Parent (base) and child (derived) class relationship',
      'Method overriding and polymorphism',
      'Access modifiers (public, protected, private)',
    ],
    evaluationCriteria: [
      'Explains that child class acquires properties and methods from parent class',
      'Mentions code reusability and avoiding duplication',
      'Explains IS-A relationship or provides a clear example',
    ],
  },
  {
    topic: 'Object-Oriented Programming',
    difficulty: 'Medium',
    type: 'Technical',
    questionText: 'Explain the difference between compile-time polymorphism (method overloading) and runtime polymorphism (method overriding) in OOP.',
    referenceConcepts: ['Method Overloading (static binding)', 'Method Overriding (dynamic dispatch)', 'Virtual method table (vtable)', 'Same signature vs different arguments'],
    evaluationCriteria: [
      'Contrasts compile-time with runtime binding',
      'Details how method overriding allows subclasses to provide specific implementations',
      'Discusses practical design patterns utilizing dynamic polymorphism',
    ],
  },
  {
    topic: 'Object-Oriented Programming',
    difficulty: 'Hard',
    type: 'Technical',
    questionText: 'Explain the SOLID design principles in software engineering with a real-world architectural example for Open-Closed Principle and Dependency Inversion.',
    referenceConcepts: ['Single Responsibility', 'Open-Closed (polymorphism)', 'Liskov Substitution', 'Interface Segregation', 'Dependency Inversion (DI/IoC)'],
    evaluationCriteria: [
      'Defines all 5 SOLID principles accurately',
      'Illustrates Open-Closed principle with extensible strategy classes instead of conditionals',
      'Explains how Dependency Inversion decouples high-level policy from low-level details',
    ],
  },

  // --- HR & Behavioral ---
  {
    topic: 'HR & Behavioral',
    difficulty: 'Medium',
    type: 'Behavioral',
    questionText: 'Describe a challenging technical disagreement you had with a team member or peer. How did you handle the situation and what was the outcome?',
    referenceConcepts: ['STAR Method (Situation, Task, Action, Result)', 'Active listening', 'Data-driven decision making', 'Constructive compromise', 'Focus on product goals'],
    evaluationCriteria: [
      'Uses structured STAR storytelling framework',
      'Demonstrates emotional intelligence and openness to peer perspectives',
      'Highlights objective evaluation of trade-offs rather than ego',
    ],
  },
  {
    topic: 'HR & Behavioral',
    difficulty: 'Easy',
    type: 'HR',
    questionText: 'Why are you interested in this software engineering role, and how do you prioritize tasks when facing tight project deadlines with conflicting requirements?',
    referenceConcepts: ['Eisenhower Matrix / Priority framework', 'Communication with stakeholders', 'Scope trimming', 'Continuous learning mindset'],
    evaluationCriteria: [
      'Clear, genuine motivation tied to technical growth and engineering values',
      'Demonstrates proactive communication when trade-offs or delays arise',
      'Structured approach to triage and project management',
    ],
  },
];
