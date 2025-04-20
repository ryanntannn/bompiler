int x = 10;
int y = 20;
int a = sum(x, y);
int b = sub(10, 30);
int c = mul(20, 40);
x = div(x, y);

if (moreThan(x, sum(5, a))) {
	x = sum(x, 1);
	if (moreThan(x, 100)) {
		x = sum(x, 2);
	} else {
		x = sum(x, 3);
	}
} else {
	x = sum(x, 2);
}

int i = 0;

while (moreThan(i, 6)) {
	i = sum(i, 1);
}

print(x);