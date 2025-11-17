先直接说结论：
GitHub Actions = GitHub 内置的「自动化流水线系统」，最常用来做 CI/CD 和各种日常脚本自动化。

---

## 一、GitHub Actions 是什么？

一句话：

> 当你的仓库里发生某个事件（push、PR、发版本、定时任务等）时，自动在云端跑一段你写好的脚本。

几个核心概念（记住这些基本能看懂 80% 教程）：

- **Workflow（工作流）**

  - 就是一份 YAML 配置文件，放在 `.github/workflows/xxx.yml`
  - 一个仓库可以有多个 workflow，比如：

    - `ci.yml` 专门跑测试
    - `deploy.yml` 专门部署

- **Event（触发事件）**

  - 什么时候跑？由 `on:` 决定，比如：

    - `push`：每次推代码
    - `pull_request`：每次有人提 PR
    - `schedule`：定时任务（类似 cron）
    - `workflow_dispatch`：手动点按钮触发

- **Job（任务）**

  - 一个 workflow 里可以有多个 job，可以并行/串行，例如：

    - `test` job：跑单元测试
    - `build` job：打包
    - `deploy` job：部署

- **Step（步骤）**

  - 每个 job 由很多 step 组成，每个 step 要么：

    - `run:` 直接执行命令
    - `uses:` 调用别人封装好的 Action

- **Action（动作）**

  - 可复用的小积木，别人帮你封装好的脚本/容器
  - 比如：

    - `actions/checkout`：把仓库代码 checkout 下来
    - `actions/setup-node`：安装 Node.js

---

## 二、什么场景会用到 GitHub Actions？

典型场景，你大概率会碰到这些 👇

1. **CI：持续集成**

   - push / PR 时自动：

     - 跑单元测试
     - Lint、格式检查（ESLint、Prettier…）
     - TypeScript type check

   - 好处：合并代码前就知道有没有炸

2. **CD：自动部署**

   - 代码合并到 `main` 分支时：

     - 自动构建前端（`npm run build`）
     - 部署到 Vercel / Netlify / GitHub Pages / 云服务器 / Docker 镜像仓库

3. **定时任务 / 自动脚本**

   - 每天/每小时：

     - 抓取数据写入仓库
     - 自动更新 README 徽章、统计信息
     - 做一些小爬虫、同步任务

4. **项目管理辅助**

   - Issue / PR 自动打标签、分配人
   - 自动欢迎首次贡献者
   - 自动关闭长时间未响应的 Issue

5. **发布流程自动化**

   - 打 tag 时：

     - 自动打包 & 发布到 npm / PyPI
     - 自动生成 Release Notes
     - 自动上传构建产物（release assets）

基本总结：
只要你「本来会在自己电脑上用脚本干的事」，都可以搬到 GitHub Actions 上，让它帮你在云端自动跑。

---

## 三、一个最简单上手的 GitHub Actions 示例

目标：

> 每次 push 到 `main` 分支时，在云端跑一次 `npm test`。

1. 在你的项目里新建：

```bash
mkdir -p .github/workflows
touch .github/workflows/ci.yml
```

2. 在 `ci.yml` 填入（最小可用版）：

```yaml
name: CI

on:
  push:
    branches: [main] # 监听 main 分支的 push

jobs:
  test:
    runs-on: ubuntu-latest # 在 GitHub 提供的 Ubuntu 虚拟机上跑

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install deps
        run: npm install

      - name: Run tests
        run: npm test
```

3. 推到 GitHub

   - 提交并 `git push` 到 `main`
   - 打开仓库 → **Actions** 页签，就能看到 workflow 在跑
   - 点进去能看到每步日志

这就是最基础的一条流水线。

---

## 四、给你一个「简单可上手」的学习路径

结合你目前技术背景，我给你一个 **从 0 → 能写常用 CI/CD 流程** 的路径，大概分 4 个阶段，你可以按小时来抓进度，而不是按天。

### 阶段 0：先补一点点前置知识（30–60min）

要懂这两个就够用：

- **YAML 语法**

  - 缩进代表层级
  - `key: value` / 列表 `- item`
  - 了解布尔、字符串基本写法

- **GitHub 仓库基本操作**

  - 会 push、开 PR
  - 知道 GitHub 仓库里的目录结构

> 如果这些都没问题，可以直接跳进阶段 1。

---

### 阶段 1：跑通官方示例 + 改一改（1–2h）

1. 找一个你维护中的项目仓库
2. 新建一个 `ci.yml`，用上面那份最小示例
3. 做几件事来 **改造它**：

   - 修改触发条件：

     - `on: [push, pull_request]`

   - 多加一个 job，比如：

```yaml
lint:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20
    - run: npm install
    - run: npm run lint
```

4. 在 PR 里看效果：

   - 提一个 PR，看 Actions 会不会自动跑
   - 故意让 `npm test` 失败，看红灯长什么样

> 阶段 1 的目标：**掌握「改装」现有 workflow 的能力**，暂时不用自己从 0 写。

---

### 阶段 2：学会「看懂别人的 Actions」并偷来改（2–3h）

1. 去你常用的开源项目里翻 `.github/workflows/`

   - 看看别人的命名、触发条件、job 结构

2. 重点观察这些套路：

   - `matrix:` 矩阵测试（多 Node 版本、多 OS）
   - `needs:` job 之间的依赖（先 build 再 deploy）
   - `secrets.GITHUB_TOKEN`、`secrets.XXX` 是怎么用的

3. 复制一个你觉得有用的 workflow，删到只剩你需要的部分：

   - 比如只保留测试 + 部署

> 阶段 2 的目标：**能读、能抄、能删减别人的 workflow**。

---

### 阶段 3：写一个对你「真正有用」的小自动化（2–4h）

挑一个你真的会用到的场景（选一个就行）：

1. **GitHub Pages / Vercel 自动部署前端**

   - 每次 push 到 `main`：

     - `npm ci && npm run build`
     - 自动发布

2. **自动发布 npm 包**

   - 当你打 tag（`v1.2.3`）或 PR 合并时：

     - 构建
     - `npm publish`

3. **定时脚本**

   - 每天 9:00：

     - 调一个 script 抓数据/更新 README

示例：定时跑脚本（每天早上 7 点 UTC）

```yaml
name: Daily Job

on:
  schedule:
    - cron: "0 7 * * *" # 注意是 UTC 时间
  workflow_dispatch: # 也允许手动触发

jobs:
  run-script:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: node scripts/daily-task.mjs
```

> 阶段 3 的目标：**至少有一个真正为你省事的 workflow 在长期跑**，而不是课程里的 demo。

---

### 阶段 4：稍微进阶一点（可选，按需看）

当你用顺手之后，可以继续看：

- **Secrets 与环境变量**

  - `secrets.MY_API_KEY`
  - `env:` 块

- **缓存优化**

  - `actions/cache` 给依赖/构建结果做缓存

- **复用 workflow**

  - `workflow_call`，把公共逻辑抽成一个可复用 workflow

这部分更多是「优化体验」，不影响你日常写一个正常的 CI/CD。

---

## 五、最后帮你总结一下学习顺序

你可以按这个 checklist 走：

1. ✅ 能看懂最基础的 `ci.yml`
2. ✅ 会把自己项目的「本地测试脚本」搬到 Actions 里跑
3. ✅ 会改触发条件 & job 结构
4. ✅ 至少配置 1 条「真实有用」的自动部署/定时任务
5. ✅ 偶尔能看懂开源仓库的复杂 workflow 并抄到自己项目里

如果你愿意，下一步我可以帮你**针对你某个具体仓库**，直接设计一套：

- `ci.yml`：测试 + lint + build
- `deploy.yml`：部署到你现在用的托管平台（Vercel / Netlify / 自己的服务器），给你一份可直接复制用的配置。
