---
layout: page
title: "파이썬 기초 문법"
permalink: /python-study/
---

## 📑 학습 목차
이 섹션에서는 파이썬의 가장 기본적인 핵심 문법들을 다룹니다.

{% for post in site.posts %}
  {% if post.category == "python-study" %}
    * [cite_start][{{ post.title }}]({{ post.url }}) - {{ post.date | date: "%Y-%m-%d" }} [cite: 307, 310]
  {% endif %}
{% endfor %}