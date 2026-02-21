---
code: CSC-1-1-TH
title: Computer Architecture Foundations
semester: 1
track: CSC
type: TH
status: Mastered
difficulty: Advanced
tags: [architecture, memory, os, cpu]
version: 1.2
visibility: public
certifications: [CompTIA A+, Security+]
---

# Computer Architecture Foundations

## Abstract

This paper covers the foundational principles of computer architecture including CPU design, memory hierarchies, instruction set architecture (ISA), and the relationship between hardware and operating systems. Understanding these fundamentals is prerequisite to all systems-level security work.

## Objectives

- Understand Von Neumann and Harvard architecture models
- Analyze CPU pipeline stages and their security implications
- Map memory hierarchy: registers, L1/L2/L3 cache, RAM, disk
- Understand how the OS abstracts hardware
- Identify attack surfaces introduced by hardware design

## Theory

### CPU Architecture

The Central Processing Unit consists of the **Arithmetic Logic Unit (ALU)**, **Control Unit (CU)**, and a set of **registers**. The fetch-decode-execute cycle is the fundamental operation of any modern CPU.

```
FETCH → DECODE → EXECUTE → WRITEBACK
```

Modern CPUs employ **speculative execution** as a performance optimization. This creates side-channel vulnerabilities such as **Spectre** and **Meltdown** — both of which exploit the CPU's branch predictor.

### Memory Hierarchy

| Level      | Latency   | Size      | Managed By |
|------------|-----------|-----------|------------|
| Registers  | < 1 ns    | ~KB       | CPU        |
| L1 Cache   | 1-4 ns    | 32–64 KB  | CPU        |
| L2 Cache   | 4-12 ns   | 256 KB–1 MB | CPU     |
| L3 Cache   | 30-60 ns  | 4–32 MB   | CPU        |
| RAM        | 60-100 ns | 4–64 GB   | OS         |
| SSD        | 100 µs    | 256 GB+   | OS/FS      |

Understanding this hierarchy is critical for **cache timing attacks** and **heap exploitation**.

### Instruction Set Architecture

ISA defines the interface between software and hardware. Common ISAs:

- **x86-64** (Intel/AMD): CISC, variable-length instructions
- **ARM64** (AArch64): RISC, fixed-length, mobile/embedded
- **RISC-V**: Open ISA, growing in embedded security research

## Lab Notes

> **Note:** Lab content is marked `visibility: private`. Owner mode required.

## Definition of Done

- [ ] Understand CPU pipeline stages
- [ ] Map full memory hierarchy from register to disk
- [ ] Explain Spectre/Meltdown at architecture level
- [x] Identify ISA differences between x86-64 and ARM64
- [x] Draw Von Neumann model from memory

## VM Requirements

- **Hornet (Attack Box):** Used for cache timing attack demos
- **Butterfly (Target Box):** Target for architecture-level exploits

## Certification Mapping

- CompTIA A+ — Core 1 Objective 3.x
- Security+ — Domain 1: Threats, Attacks, Vulnerabilities

## Changelog

| Version | Date       | Change              |
|---------|------------|---------------------|
| 1.0     | 2026-01-10 | Initial draft       |
| 1.1     | 2026-02-01 | Added cache tables  |
| 1.2     | 2026-02-14 | DoD checklist added |
