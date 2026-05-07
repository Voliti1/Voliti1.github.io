---
layout: page
title: "Python Study 목록"
permalink: /python-study/
---

### 📘 학습 목차
아래 항목을 클릭하면 상세 내용을 볼 수 있습니다.

<ul>
  {% for post in site.categories['python-study'] %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a> 
      <small>({{ post.date | date: "%Y-%m-%d" }})</small>
    </li>
  {% endfor %}
</ul>