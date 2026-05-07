# Python(파이썬)


## Variable(변수)

값을 저장하기 위한 메모리 공간

## Data Type(자료형)
### 숫자형(Number)<hr>

**Int**
- 정수 저장하는 자료형
- ex) 0, -1, 1

**Float**
- 실수 저장하는 자료형
- Float는 Floating Point(부동소수점)에서 따옴
- ex) 0.0, -1.2, 123.456
- 지수표현 방식도 사용 가능

### Operator(연산자)

- 덧셈 : +
- 뺄셈 : -
- 곱셈 : *
- 나눗셈 : /
- 몫 : //
- 나머지 : %
- 제곱 : **
### 연산자 우선순위
1. 제곱 연산자
2. 곱셈, 나눗셈, 나머지, 몫 연산자
3. 덧셈, 뺄셈 연산자
4. 괄호()를 통해 우선순위 변경 가능

### 복합 연산자
- a += b : a = a + b와 같음
- a -= b : a = a - b와 같음
- a *= b : a = a * b와 같음
- a /= b : a = a / b와 같음
- a //= b : a = a // b와 같음
- a %= b : a = a % b와 같음
- a **= b : a = a ** b와 같음

```python
a = 3; b = 2
print("a =", a ,"b =", b)
print("a + b =", (a + b))
print("a - b =", (a - b))
print("a * b =", (a * b))
print("a / b =", (a / b))
print("a // b =", (a // b))
print("a % b =", (a % b))
print("a ** b =", (a ** b))

```
**실행 결과:**
```
a = 3 b = 2
a + b = 5
a - b = 1
a * b = 6
a / b = 1.5
a // b = 1
a % b = 1
a ** b = 9
```

### 시퀀스 자료형<hr>
#### 각각의 요소들이 연속적으로 이어진 자료형
- 문자열(string) : '', "" ex) "123", '123'
- 리스트(list) : [] ex) [1, 2, 3]
- 튜플(tuple) : (), ex) (1, 2, 3), (1,)
튜플은 생성 이후 요소 변경 불가능<br><br>

- Index : 시퀀스 내 각 요소 위치, 0 기반 인덱스 사용, -1은 마지막 요소
- Indexing : 특정 위치의 원소 가져오기
- Slicing : 리스트나 문자열의 일부분을 잘라서 가져오기 ex) list[0:1], 시작인덱스 요소는 포함, 끝 인덱스 요소는 제외

#### * 복합 자료형
- 리스트(list) - 순서가 있는 변경 가능한 자료형
- 튜플(tuple) - 순서가 있는 변경 불가능한 자료형
- 딕셔너리(dictionary) - 키와 값의 쌍을 가지는 자료형, 키값은 유일
- 집합(set) - 중복을 허용하지 않는 순서가 없는 자료형

### 문자열(String) <hr>
- 문자들의 집합, 문자, 단어의 모임
- 'string', "string", '''string''', """string"""의 4가지 방법

#### Escape Code
- \n - 줄바꿈 
- \t - 탭 간격 생성
- \\' - ' 표현 
- \\" - " 표현 
- \\\ - \ 표현 
- 활용 빈도가 높은 5가지

```python
a = "Just\n do it!!"
b = "010\t1234\t5678"
c = "\'   \"   \\  "
print(a); print(b); print(c)
```
**실행 결과:**
```
Just
 do it!!
010	1234	5678
'   "   \
```

### 문자열 연산<hr>
- #### 문자열 더하기

```python
a = "Python"
b = " is fun"

print(a + b)
```
**실행 결과:**
```
Python is fun
```

- #### 문자열 곱하기

```python
a = "Python"
print(a * 2)
```
**실행 결과:**
```
PythonPython
```

### 문자열 Indexing & Slicing <hr>
#### 문자열 Indexing

* [I][\t][l][i][k][e][\t][g][a][m][e]
* [0][1][2][3][4][5][6 ][7][8][9][10]
* [-11][-10][-9].....[-4][-3][-2][-1]

```python
g = "I like game"

a = g[0]
b = g[-11]
print(a); print(b)

c = g[1]
print(c)

d = g[-4] + g[-3]+ g[-2] + g[-1]
print(d)
```
**실행 결과:**
```
I
I
 
game
```

#### 문자열 Slicing
문자열을 원하는 지점부터 원하는 크기만큼 분해

- 변수명[첫번째 항목 인덱스:마지막 항목 인덱스 + 1]
- 마지막 항목 + 1로 지정하는 것이 매우 중요
- 첫번째 항목 인덱스를 설정하지 않으면, 0번 인덱스부터 추출
- 마지막 항목 인덱스를 설정하지 않으면, 마지막 항목까지 추출

```python
text = "I like Kimchi"
print(text[2:6])
print(text[7:13])
print(text[7:])
print(text[:6])
```
**실행 결과:**
```
like
Kimchi
Kimchi
I like
```

### 문자열 관련 함수
- LEN() : 문자열 길이 구하기
- COUNT() : 특정 문자 수 세기
- UPPER() : 모든 문자 대문자로 변경
- LOWER() : 모든 문자 소문자로 변경
- STRIP() : 양쪽 공백 지우기
- LSTRIP() : 왼쪽 공백 지우기
- RSTRIP() : 오른쪽 공백 지우기
- SPLIT() : 문자열 원하는 형식으로 나누기
- REPLACE() : 문자열 원하는 문자열로 바꾸기
- JOIN() : 문자열 사이사이에 문자 삽입

#### LEN()
공백, Escape Code를 포함한 문자열의 길이를 구하는 함수<br>
Escape Code의 경우 \t 를 하나의 문자로 취급

```python
text = "I like\tKimchi"

len(text)
```
**실행 결과:**
```
13
```

#### COUNT()
문자열에 속한 특정 문자의 개수를 세는 함수

```python
text = "I like Kimchi"
print(text.count('i'))
```
**실행 결과:**
```
3
```

#### UPPER()
대문자 변경
#### LOWER()
소문자 변경

```python
a = "upper"
b = "LOWER"
c = "HaLf"

print(a.upper())
print(b.lower())
print(c.upper())
print(c.lower())
```
**실행 결과:**
```
UPPER
lower
HALF
half
```

#### STRIP(), LSRTIP(), RSRTIP()
공백 지우는 함수

```python
text = " center "

print(text.strip()) # " center "
print(text.lstrip()) # "center "
print(text.rstrip()) # " center"
```
**실행 결과:**
```
center
center 
 center
```

#### SPLIT()
문자열을 특정 기준에 따라 분리
- 형식 미지정 : 공백, TAB, 엔터 기준 분리
- 형식 지정 : 형식에 맞춰 분리
- 분리된 결과 : 리스트 형식으로 저장

```python
text1 = "Split test setence"
print(text1.split())

text2 = "p,y,t,h,o,n"
print(text2.split(','))
```
**실행 결과:**
```
['Split', 'test', 'setence']
['p', 'y', 't', 'h', 'o', 'n']
```

#### REPLACE()
문자열을 원하는 문자열로 대체

```python
text = "I like Kimchi"
print("원래 문장 : "+ text, "\n바뀐 문장 : "+ text.replace("Kimchi", "Steak"))
print("원래 문장 : "+ text, "\n바뀐 문장 : "+ text.replace("I", "You"))

```
**실행 결과:**
```
원래 문장 : I like Kimchi 
바뀐 문장 : I like Steak
원래 문장 : I like Kimchi 
바뀐 문장 : You like Kimchi
```

#### JOIN()
문자열 사이사이에 특정 문자 삽입

```python
word = "python"
print((',').join(word))
```
**실행 결과:**
```
p,y,t,h,o,n
```

### 문자열 Formatting
문자열에서 변수나 값을 원하는 형식으로 출력
1. 숫자 대입  2. 문자 대입  3. 변수 통해 값 대입
<hr>

### 문자열 Format Code

- %s : String(문자열)
- %c : Char(문자 1개)
- %d : Int(정수)
- %f : Float(실수)
- %o : 8진수
- %x : 16진수

```python
print("%d명의 학생이 교실에 있다" % 9)

print("나는 %s학과이다" % "반도체장비소프트웨어")

print("지금 온도는 %f도 이다" % 16.5)
```
**실행 결과:**
```
9명의 학생이 교실에 있다
나는 반도체장비소프트웨어학과이다
지금 온도는 16.500000도 이다
```

### 사용자 입력 함수 INPUT()
사용자에게 문자열을 입력받아 변수에 저장하는 함수

- 변수 = input("문자열을 입력하세요 : ")
- input으로 받은 모든 값은 string 형태로 변수에 저장되므로 다른 자료형으로 사용하려면 자료형 변환을 사용해야 한다

```python
a = int(input('정수를 입력해주세요:'))
b = float(input('실수를 입력해주세요:'))

print(a+b)
```
**실행 결과:**
```
6.4
```

### 리스트 자료형(list) <hr>
모든 종류의 자료형을 자유롭게 묶어서 사용할 수 있는 자료형의 묶음

- list = [1, "문자열", -0.5, '안녕']

```python
a = list()
a = []

b = [1, "문자열", -0.5, '안녕']

c = list(b)

print(a); print(b); print(c)
```
**실행 결과:**
```
[]
[1, '문자열', -0.5, '안녕']
[1, '문자열', -0.5, '안녕']
```

### 리스트 Indexing

- 리스트도 문자열과 유사하게 Indexing이 가능
- 단, 문자열이나, 리스트 내부의 리스트도 하나의 요소로 취급한다.

```python
a = [1, "문자열", -0.5, '안녕']
print("a[0] : " + str(a[0]))
print("a[1] : " + a[1])
print("a[2] : " + str(a[2]))
print("a[3] : " + a[3])

print("a[1][0] : " + a[1][0])
print("a[1][1] : " + a[1][1])
print("a[1][0] : " + a[1][2])
print()

b = [1, 2, [3, 4, 5]]
print("b[0]: "+ str(b[0]))
print("b[1]: "+ str(b[1]))
print("b[2]: "+ str(b[2]))
print("b[2][0]: "+ str(b[2][0]))
print()

c = [1, 2, 3, ['I', 'like', 'python', ['a', 'b', 'c']]]
print(c[3][2][5])
```
**실행 결과:**
```
a[0] : 1
a[1] : 문자열
a[2] : -0.5
a[3] : 안녕
a[1][0] : 문
a[1][1] : 자
a[1][0] : 열

b[0]: 1
b[1]: 2
b[2]: [3, 4, 5]
b[2][0]: 3

n
```

### 리스트 Slicing
- 문자열과 동일한 방법으로 슬라이싱 가능
- 리스트 중복시 Indexing 후 슬라이싱 해야 한다.

```python
a = [1, 2, 3, ['I', 'like', 'Python', ['e', 'f', 'g']]]


print(a[0:2])
print(a[3][0:2])
print(a[3][2])
```
**실행 결과:**
```
[1, 2]
['I', 'like']
Python
```

### 리스트 덧셈, 곱셈
- 리스트 덧셈 : 더하는 리스트가 하나로 합쳐짐
- 리스트 곱셈 : 곱하는 수만큼 리스트 반복

```python
x = [1, 2, 3]
y = [4, 5, 6]

z = x + y
print(z)

# 리스트 곱셈
print(x*3)
print(z*2)
```
**실행 결과:**
```
[1, 2, 3, 4, 5, 6]
[1, 2, 3, 1, 2, 3, 1, 2, 3]
[1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6]
```

### 리스트 관련 함수
 - LEN() : 리스트의 길이 구하기
 - APPEND() : 리스트에 요소 추가
 - SORT() : 리스트 정렬
 - REVERSE() : 리스트 뒤집기
 - INDEX() : 요소의 위치 찾기
 - INSERT() : 요소 삽입하기
 - REMOVE() : 요소 제거하기
 - POP() : 요소 추출하기
 - COUNT() : 요소의 개수 세기

### LEN()
리스트의 길이 구하는 함수

```python
a = [1, 2, 3, ['I', 'like', 'Python', ['e', 'f', 'g']]]

print(len(a))
print(len(a[3]))
print(len(a[3][2]))
```
**실행 결과:**
```
4
4
6
```

### APPEND()
리스트에 요소 추가

```python
a = []

a.append(1)
print(a)
```
**실행 결과:**
```
[1]
```

### SORT()
리스트 정렬

```python
a = [2, 3, 4, 1, 5]

a.sort()
print(a)
```
**실행 결과:**
```
[1, 2, 3, 4, 5]
```

### REVERSE()
리스트 뒤집기

```python
a = [1, 2, 3, 4, 5]
b = [5, 4, 3, 2, 1]

a.reverse()
b.reverse()
print(a)
print(b)
```
**실행 결과:**
```
[5, 4, 3, 2, 1]
[1, 2, 3, 4, 5]
```

### INDEX()
요소의 위치 찾기
- 리스트 내에 동일한 값이 존재할 때, 가장 앞 요소의 Index 반환
- 리스트 내에 없는 값을 찾을 시 에러 발생

```python
a = ["사과", "배", "감", "수박", "딸기", "감"]
print(a.index("감"))
print(a.index("딸기"))
```
**실행 결과:**
```
2
4
```

### INSERT()
리스트의 원하는 위치에 요소 삽입
- insert(위치, 값)

```python
a = [1, 2, 3, 4, 5]
print(a)

a.insert(3, 4)
print(a)
```
**실행 결과:**
```
[1, 2, 3, 4, 5]
[1, 2, 3, 4, 4, 5]
```

### REMOVE()
리스트의 원하는 요소 제거
- 동일한 값이 있을 때, 첫 번째 값 제거

```python
a = [1, 2, 4, 7, 8, 2, 5]
print(a)

a.remove(2)
print(a)

a.remove(7)
print(a)
```
**실행 결과:**
```
[1, 2, 4, 7, 8, 2, 5]
[1, 4, 7, 8, 2, 5]
[1, 4, 8, 2, 5]
```

### POP()
리스트의 원하는 위치에 있는 요소 추출

```python
a = [1, 2, 3, 4, 5]
print(a)

b = a.pop(3)
print(a)
print(b)
```
**실행 결과:**
```
[1, 2, 3, 4, 5]
[1, 2, 3, 5]
4
```

### COUNT()
리스트에 있는 원하는 요소의 개수 세기

```python
a = [1, 5, 4, 2, 4, 2, 3, 2, 4, 5, 6, 7, 1]
print(a)

print(a.count(2))
```
**실행 결과:**
```
[1, 5, 4, 2, 4, 2, 3, 2, 4, 5, 6, 7, 1]
3
```

### 리스트 요소 추가, 수정, 삭제
- 추가 : append()
- 수정 : 리스트 요소에 직접 접근하여 수정
- 삭제 : del

```python
a = [1, 2, 3, 4, 5]
print(a)

a.append(6)
print(a)

a[5] = 7
print(a)

del a[5]
print(a)
```
**실행 결과:**
```
[1, 2, 3, 4, 5]
[1, 2, 3, 4, 5, 6]
[1, 2, 3, 4, 5, 7]
[1, 2, 3, 4, 5]
```

### 튜플 자료형(tuple) <hr>
리스트와 마찬가지로, 모든 자료형을 담을 수 있는 자료형
튜플은 한 번 생성하면 값의 변경, 삭제가 불가능하다.

- Indexing
- Slicing
- 튜플 더하기
- 튜플 곱하기
- LEN() 함수
- 위의 기능만 사용 가능

```python
t1 = (1, 2, 3, ('I', 'like', 'Python', ('e', 'f', 'g')))
print(t1)

#요소가 하나인 튜플
t2 = (2,)
print(t2)

#튜플 생성 시 괄호 생략 가능
t3 = 1, 2, 3
print(t3)
```
**실행 결과:**
```
(1, 2, 3, ('I', 'like', 'Python', ('e', 'f', 'g')))
(2,)
(1, 2, 3)
```

### 불 자료형(BOOL) <hr>
True(참), False(거짓) 값만 갖는 자료형

```python
a = True
b = False

print(type(a))
print(type(b))
print(a)
print(b)
```
**실행 결과:**
```
<class 'bool'>
<class 'bool'>
True
False
```

### 비교 연산자
값의 비교를 통해 True, False의 값을 얻을 수 있는 연산자
- a == b a와 b가 같다
- a != b a와 b가 다르다
- a \> b a가 b보다 크다
- a < b a가 b보다 작다
- a <= b a가 b보다 작거나 같다
- a \>= b a가 b보다 크거나 같다

```python
x = 1
y = 2

print("x==y: "+str(x == y))
print("x!=y: "+str(x != y))
print("x>y: "+str(x > y))
print("x<y: "+str(x < y))
print("x<=y: "+str(x <= y))
print("x>=y: "+str(x >= y))
```
**실행 결과:**
```
x==y: False
x!=y: True
x>y: False
x<y: True
x<=y: True
x>=y: False
```

### 논리 연산자
논리 연산시 사용하는 연산자
- and
- or
- not

```python
a = True
b = False

print("True and True: "+str(a and a))
print("True and False: "+str(a and b))
print("False and True: "+str(b and a))
print("False and False: "+str(b and b))

print("True or True: "+str(a or a))
print("True or False: "+str(a or b))
print("False or True: "+str(b or a))
print("False or False: "+str(b or b))

# not 연산자
print("not True: "+str(not a))
print("not False: "+str(not b))
```
**실행 결과:**
```
True and True: True
True and False: False
False and True: False
False and False: False
True or True: True
True or False: True
False or True: True
False or False: False
not True: False
not False: True
```

### 딕셔너리 자료형 <hr>
사전, key와 value를 한 쌍으로 가지는 자료형
- Key를 통해서 Value 값에 접근
- 순서가 없기 때문에, Indexing 및 Slicing이 불가능
- Key값은 고유한 값이므로 중복 불가

```python
dic1 = {'a': 'alpha', 'b': 'beta', 'g': 'gamma'}
dic2 = {1 : 'hello', 2 : [4, 5, 6], '3' : 9}

print(dic1)
print(dic2)
```
**실행 결과:**
```
{'a': 'alpha', 'b': 'beta', 'g': 'gamma'}
{1: 'hello', 2: [4, 5, 6], '3': 9}
```

### 딕셔너리 요소 추가 및 삭제
#### 추가
- 변수명[Key] = Value
#### 삭제
- del 변수명[Key]

```python
dic = {1 : 'one', 2 : 'two'}
print(dic)

dic[3] = 'three'
print(dic)

del dic[1]
print(dic)

print(dic[2])

test_dic = {1:'one', 2:'two', 2:'둘', 3:'셋', 3:'three', 3:'삼'}
print(test_dic)
```
**실행 결과:**
```
{1: 'one', 2: 'two'}
{1: 'one', 2: 'two', 3: 'three'}
{2: 'two', 3: 'three'}
two
{1: 'one', 2: '둘', 3: '삼'}
```

### 딕셔너리 관련 함수
 - keys() : key 리스트 만들기
 - values() : value 리스트 만들기
 - items() : key, value 쌍 리스트 얻기 (튜플형식)
 - clear() : 딕셔너리 초기화
 - get() : key값을 통해 value값 얻기
 - in : key가 딕셔너리에 있는지 찾아보기(true, false)

```python
dic = {'사과': 'apple', '바나나': 'banana', '메론': 'melon'}
print(dic.keys())
print(dic.values())
print(dic.items())

print(dic.get('바나나'))
print('사과' in dic)
print('수박' in dic)

dic.clear()
print(dic)
```
**실행 결과:**
```
dict_keys(['사과', '바나나', '메론'])
dict_values(['apple', 'banana', 'melon'])
dict_items([('사과', 'apple'), ('바나나', 'banana'), ('메론', 'melon')])
banana
True
False
{}
```

