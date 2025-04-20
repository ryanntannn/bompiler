int x = 10;
int y = 20;
int a = sum(x, y);
int b = sum(10, 30);
int c = sum(20, 40);
x = sum(x, y);

if (moreThan(x, 5)) {
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