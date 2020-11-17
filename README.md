# Blogging REST API

[Notion page](https://www.notion.so/Implementation-One-8df2581f770141b8bda1acbff67b4185)

## Requirements

## Functional requirements

- [ ] There is only one user
- [ ] User write a blog using MarkDown language
- [ ] User can preview the HTML result of the written markdown before publishing
- [ ] Uploaded media files hosted on local file system
- [ ] Login using email and password
- [ ] A blog contains title, excerpt, body (content), cover image, author, created and updated date & time, custom fields, and its SEO information
- [ ] A blog may have zero or many custom fields
- [ ] A custom field in a blog may have one or many field values.
- [ ] A custom field has a name, description, and its value e.g. `front-end` is a value of the `development side` custom field, and `React` is a value of the `framework` custom field
- [ ] A custom field's value has name and description
- [ ] SEO information includes:
  - [ ] Title
  - [ ] Cover image
  - [ ] Description
  - [ ] OpenGraph info
  - [ ] Twitter card info
- [ ] User can create/update/delete custom fields and their values
- [ ] User can access all uploaded media files
- [ ] Visitor can search for blogs using keywords
- [ ] Visitor can filter for blogs by custom fields

---

## Stack

- Back-end (REST API): Nest.js + TypeScript
- Front-end: Next.js + TypeScript

  For both blogging website and blog editor

- Database: MySQL

---

## ER diagram

[ER diagram](https://www.notion.so/ER-diagram-bcec26b09da944e49cab8f7c8c16f9af)

---

## Open API schema

[Open API schema](https://www.notion.so/Open-API-schema-7c4d11c2dc4c4a6db99b151fae13aebd)

---

## UI design

[UI design](https://www.notion.so/UI-design-6d90d8ce191f4d17b8abbfcf1a7b618f)
