import sys
import json


def main():
    data = []
    for line in sys.stdin:
        data.append(line.strip())
    print(json.dumps(data))


if __name__ == "__main__":
    main()
