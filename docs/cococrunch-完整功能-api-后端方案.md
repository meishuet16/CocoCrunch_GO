# CocoCrunch — 完整功能、API 与后端方案

## 目的

CocoCrunch 是一个从行前到行后全流程的 Solo / Group 旅行规划 App。它以 **Tingo Card** 长期偏好、这次旅行的目标与限制、预算、群组共识和现实状况为输入，帮助用户规划、协商、应变和复盘。

Tingo Card 是 App 内的旅行人格与长期偏好引擎，不是独立产品。

## 产品与技术决策

- **产品名称：** CocoCrunch。
- **后端基础：** Supabase（Auth、Postgres、RLS、Realtime、Storage、Edge Functions）。浏览器绝不直接调用付费或私有 API。
- **保留规则核心：** `src/domain/` 的 Must-Go 保护、Deal Breaker、Court、仅平局 Gacha、最小损失修复、显式学习和隐私规则仍是权威；外部 API 只提供真实资料。
- **AI 只负责提议：** 任何实质计划变更都必须预览、确认且可撤销；群组还须经过 Court 或 Emergency Court。
- **地图：** 使用 Google Maps Routes API `computeRoutes` 与 Places API (New)，不采用旧的 Distance Matrix API。

## 共用后端基础设施

| 能力 | API | 后端实现 |
|---|---|---|
| 身份与成员管理 | 无 | Supabase Auth；`profiles`、`trips`、`trip_members`。RLS 限制成员只访问所属旅行。 |
| 源数据与审计 | 无 | Postgres 保存用户输入、确认决定、同意记录和修复前快照；重新推导 Tingo 维度、Group DNA、Plan Health 与行程。 |
| 实时协作 | 无 | Supabase Realtime；投票、Court、成员状态与行程更新实时同步。 |
| 第三方与 AI 网关 | OpenAI/Anthropic、地图、天气、价格服务 | Edge Functions 持有密钥，并执行限流、验证、缓存和错误降级。 |
| 媒体与公开内容 | 无 | Storage 保存照片和生成素材；签名 URL；默认 `visibility = private`。 |
| 安全 | 无 | RLS、函数授权、审计记录、Webhook 签名验证和最小化位置资料保存。 |

## 完整功能地图

| 产品区域 | 功能 | 外部 API | 所需后端 |
|---|---|---|---|
| Me | **Tingo Card、基础打包偏好、学习档案。** 产生节奏、预算、舒适度、饮食、探索欲、计划性、灵活度、社交倾向等可解释维度。 | 无；可选 LLM 输出复盘总结。 | `tingo_profiles`、`tingo_history`、打包偏好。问卷答案是唯一真相来源；学习需确认才写入。 |
| 行程设置 | **Solo/Group、目的地、Trip Vibe、Must-Go、Deal Breaker、Preference、Flexible、人情安排、Trip Promise。** | OpenAI/Anthropic 提供目的地灵感；Google Places Autocomplete/Geocoding 标准化地点。 | `trip-create`、`destination-suggest`；`trips`、`trip_members`、`trip_intents`、`trip_constraints`、`commitments`。 |
| 发现 | **外部链接适配度、Community 灵感、保存想法、提交群组提案。** 不会静默加入正式行程。 | 支持来源的公开/嵌入 API、LLM 结构化提取、地点查询。 | 白名单 URL 导入函数和 SSRF 防护；`ideas`、`imported_links`、`community_posts`、`community_saves`。 |
| 行程规划 | **打包清单、锚点/浮动项、自由时间、惊喜预算、可行性、提醒、最慢成员估时、Plan Health、Why this?** | Google Routes、Places API (New)、Open-Meteo。 | `plan-generate`、`plan-validate`；`itinerary_items`、`plan_evidence`、`plan_health_snapshots`、`reminders`、`packing_items`。路线失败时降级为标注清楚的距离/速度估算。 |
| 预算 | **性格导向比价、分类预算、应急预备金、剩余预算替代方案、计划 vs 实际。** | Amadeus、Kiwi 或合作方价格 API；MVP 可用人工维护 `deals`。 | `price-search`；`budget_categories`、`expenses`、`price_offer_cache`、`deals`。浏览显示参考价，锁定计划时才实时刷新。 |
| 群组理解 | **Group Travel DNA、明确冲突、建议角色、共享工作区、轮值规划人、Decision History。** | 无；LLM 仅协助解释。 | `member_preferences`、`group_conflicts`、`member_roles`、`decision_history`、`planner_turns`；服务端推导 Group DNA。 |
| Group Court | **提案、讨论、投票、让步/交换、确认、平局 Gacha、Backup Plan。** | 无。 | Realtime + `cast_court_vote` Postgres RPC；`court_proposals`、`court_options`、`court_votes`、`court_comments`、`concessions`、`backup_plan_pool`。投票由 SQL 原子统计。 |
| 旅途中 | **Live Timeline、天气调整、检查点、到达检测、最小损失修复、Ghost Itinerary、Emergency Court。** | Open-Meteo、Google Routes/Places、可选航班状态 API。 | `disruption-check`、`repair-preview`；`disruption_events`、`repair_previews`、`repair_applications`、`checkpoints`、`disruption_alerts`。先保护锚点，再调整浮动项。 |
| 中断检测 | **航班、地理围栏、换乘触发式检测。** 不做持续轮询。 | 航班状态 API、Radar.io/原生地理围栏、OneSignal。 | 每趟航班仅在起飞前和预计到达后检查；推送提供“已到达/要迟到了”，设置 TTL 与 collapse key。 |
| 群组状态 | **心情/疲劳、Group Heartbeat、智能拆队、汇合协议。** | 可选 Google Routes ETA。 | `checkins`、`member_status`、`splits`、`reunion_agreements`；仅同步 `together`、`on-time`、`delayed`、`needs-decision` 等状态。 |
| 安全与本地协助 | **安全打卡、紧急联系人、医院、药局、行李寄存。** | Google Places Nearby Search 或 OpenStreetMap Overpass。 | `nearby-services`；`emergency_contacts`、`safety_checkins`、`nearby_services_cache`。 |
| AI 陪伴 | **Coco/Tingo 助手读取计划、回答问题、提出修改。** | OpenAI Responses API 或 Anthropic Messages API。 | `assistant-propose` 返回有依据的 `pending_change`；套用须单人确认或 Group Court/Emergency Court；变更有审计与撤销。 |
| 娱乐 | **幸运签、抽签小游戏与仪式动画。** 不影响任何真实决定。 | 无。 | 本地状态即可；若持久化，使用独立 `ritual_events`，不可连接规划或学习流程。 |
| 回忆 | **照片地图、旅行日记、Memory Card、Worth It、计划 vs 实际、预算 vs 实际。** | `exifr`、Mapbox/Google Maps JS、可选 Replicate/OpenAI Image API。 | Storage；`photos`、`journal_entries`、`item_reviews`、`retrospectives`、`memory_cards`。图像生成用异步任务、已验证 Webhook 与 Realtime 更新。 |
| Community | **主动公开完成行程与精选回忆；浏览、收藏、举报。** | 无。 | `publish-community-post`；`community_posts`、`community_post_items`、`community_saves`、审核队列；取消公开立即下架。 |
| 产品体验感 | **Coco 陪伴、仪式感与动画。** | 无。 | 默认无后端需求；保留现有客户端素材，性能需要时才转换 Lottie/Rive。 |

## 生产环境不变量

1. Must-Go 不能被 AI、Repair 或投票静默替换。
2. Deal Breaker 必须在候选方案展示前过滤。
3. 群组正式行程的重大变更是服务端授权的治理事件。
4. Gacha 只适用于真正的 Court 平局；日常抽签走独立数据路径。
5. Backup Plan 仅包含可行且不违反 Deal Breaker 的落选项。
6. 中断修复必须保护锚点、预览影响、用户确认且可 Undo。
7. 默认不公开 Community 内容，不展示精确位置，也不持续追踪位置。
8. 复盘只能创建学习提议；用户确认后才更新长期偏好。

## App 简单说明

CocoCrunch 先通过 Tingo Card 理解个人旅行偏好，再结合 Trip Vibe、预算、Must-Go 和 Deal Breaker 生成可解释的旅行计划。群组旅行时，系统生成 Group Travel DNA 并明确显示分歧；有争议则进入 Group Court 投票，真平票才使用 Gacha，合适的落选方案会保留为 Backup Plan。

旅途中发生天气、延误或赶不上行程时，系统优先保护 Must-Go 锚点，提出可预览、可确认、可撤销的最小损失修复方案。旅行结束后，用户可查看照片、日记、项目评分、预算/行程复盘，并自行决定是否把经验用于下一趟旅行推荐。

## 使用流程

1. 注册并完成 Tingo Card。
2. 创建 Solo 或 Group 行程。
3. 输入目的地，或让 AI 提供目的地建议。
4. 设定 Trip Vibe、Must-Go、Deal Breaker、偏好、日期与预算。
5. 群组成员填写偏好，生成 Group Travel DNA 与冲突提示。
6. 查看自动生成的行程、Plan Health、预算和 Why this?。
7. 有分歧时进入 Group Court；平票才使用 Gacha；落选可行项进入 Backup Plan。
8. 出发后使用时间线、天气、状态、心情、汇合与安全工具。
9. 行程受影响时查看修复预览；Solo 确认或 Group 进入 Emergency Court。
10. 拍照、打卡、记录日记与 Worth It 评分。
11. 旅行结束后完成复盘，并确认是否更新长期偏好。
12. 可选择发布到 Community，或浏览他人公开行程。

## 构建顺序

1. **P0 Demo 主线：** Supabase Auth/RLS、资料与行程持久化、Group DNA、Plan Health、Court、Realtime、Gacha、Backup Plan、天气触发修复预览。
2. **P1 可用旅行体验：** 真实路线/地点、价格缓存、提醒、打包、状态、汇合、安全查询与推送打卡。
3. **P2 留存与扩展：** 照片、地图、日记、复盘学习、Memory Card、Community 与受限外部链接导入。

## 现有代码迁移方式

保留 `src/domain/tingo.ts`、`preferences.ts`、`group-dna.ts`、`itinerary.ts`、`plan-health.ts`、`court.ts`、`backup-repair.ts`、`budget.ts` 及其测试。将本地持久化替换为 Supabase 源数据持久化；将本地演示适配器替换为由 Edge Functions 包装的地图、天气、价格、安全与 AI 服务，并持续显示资料来源、缓存状态与兜底估算。
