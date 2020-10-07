import os, sys


def split(file, size=90000000, suffix=2):
	''' The split function divides a file into as many files as required to
	    keep the number of bytes in each file to <= size. It creates files
	    using the base file name (e.g. file.zip would be split into a number
	    of file.zip.## files), with an appended number of <suffix> digits.
	'''

	if not os.path.exists(file):
		print("Error: File", file, "does not exist.")
		sys.exit(1)

	try:
		size = int(size)
	except:
		print("Error: num_bytes must be an integer.")
		usage()
		sys.exit(1)

	try:
		suffix = int(suffix)
	except:
		print("Error: num_suffix_digits must be an integer.")
		usage()
		sys.exit(1)

	fcount = 0
	with open(file, 'rb') as source:
		flength = source.seek(-1, 2) + 1	# Get file length
		source.seek(0)						# Restore ptr to beginning
		while source.tell() < flength:
			data = source.read(size)
			if len(data) > 0:
				split_file = file + '.' + str(fcount).zfill(suffix)
				with open(split_file, 'wb') as output:
					output.write(data)
			fcount += 1



def usage():
	print('Usage:')
	print('python3 split.py filename [num_bytes] [num_suffix_digits]')
	print('\twhere:')
	print('\t\tfilename must exist, and can be a full or partial path.')
	print('\t\tnum_bytes is the desired maximum size of each split file.')
	print('\t\tnum_suffix_digits determines the split file names. For example:\n')
	print('\t\t\tpython split.py myfile.zip 80000 2\n')
	print('\t\twould create files <= 80kBytes each named myfile.zip.00, myfile.zip.01...')

if __name__ == '__main__':

	if len(sys.argv) < 2:
		print("Error: At least the filename argument is required.")
		usage()
		sys.exit(-1)
	elif len(sys.argv) > 4:
		print("Error: Too many arguments provided.")
		usage()
		sys.exit(-1)
	elif len(sys.argv) == 2:
		split(sys.argv[1])
	elif len(sys.argv) == 3:
		split(sys.argv[1], sys.argv[2])
	else:
		split(sys.argv[1], sys.argv[2], sys.argv[3])