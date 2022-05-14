import type { NextPage } from "next";
import * as React from "react";
import { Sun, MoonStars } from "tabler-icons-react";
import {
  Table,
  Tooltip,
  TextInput,
  Button,
  Group,
  SegmentedControl,
  Stack,
  AppShell,
  Header,
  Title,
  useMantineColorScheme,
  ActionIcon,
  InputWrapper,
  Footer,
} from "@mantine/core";
import { useEffect } from "react";
const Home: NextPage = () => {
  const [table, setTable] = React.useState<{ name: string; time: string }[]>(
    []
  );
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<string[]>([""]);
  const [error, setError] = React.useState("");
  const [type, setType] = React.useState("code");
  const [success, setSuccess] = React.useState(false);

  useEffect(() => {
    const table = localStorage.getItem("table");
    if (table) {
      setTable(JSON.parse(table));
      setSuccess(true);
    }
  }, []);

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const newCodes = [...data];
    newCodes[+id] = value;
    setData(newCodes);
  };
  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    fetch("/api/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        data,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.error) {
          setError(data.error);
        } else {
          setTable(data);
          setSuccess(true);
          localStorage.setItem("table", JSON.stringify(data));
        }
      })
      .catch((err) => setError(err));
  };
  const deleteRow = (i: number) => {
    const newCodes = [...data];
    newCodes.splice(i, 1);
    setData(newCodes);
  };
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  return (
    <AppShell
      padding="md"
      footer={
        <Footer height={"10vh"}>
          <Title order={6}>
            Made by{" "}
            <a
              target="_blank"
              href="https://www.jankaram.com/"
              rel="noreferrer"
            >
              Jan Karam
            </a>
          </Title>
        </Footer>
      }
      header={
        <Header
          height={"10vh"}
          p="xs"
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <Title order={1}>College table</Title>
          <ActionIcon
            variant="outline"
            color={dark ? "yellow" : "blue"}
            onClick={() => toggleColorScheme()}
            title="Toggle color scheme"
          >
            {dark ? <Sun size={18} /> : <MoonStars size={18} />}
          </ActionIcon>
        </Header>
      }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      {success ? (
        <>
          {table.length > 0 ? (
            <Stack sx={{ maxWidth: "500px", minHeight: "80vh" }}>
              <Table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Time</th>
                  </tr>
                </thead>
                {table?.map((item, i) => (
                  <tr key={item.name + i}>
                    <td>{item.name}</td>
                    <td>{item.time}</td>
                  </tr>
                ))}
              </Table>
              <Button
                onClick={() => setSuccess(false)}
                sx={{ maxWidth: "100px" }}
              >
                {" "}
                Go back{" "}
              </Button>
            </Stack>
          ) : null}
        </>
      ) : (
        <form onSubmit={submitHandler}>
          <Stack sx={{ maxWidth: "500px", minHeight: "80vh" }}>
            <Button
              type="button"
              sx={{ maxWidth: "100px" }}
              onClick={() => setData([...data, ""])}
            >
              Add Row
            </Button>
            <InputWrapper
              id="type"
              label="Type to search"
              description="Please select type to search with"
            >
              <SegmentedControl
                data={[
                  { label: "Code", value: "code" },
                  { label: "Name", value: "name" },
                ]}
                onChange={setType}
              />
            </InputWrapper>

            <Stack>
              <Title order={4}>Enter data</Title>
              {data?.map((code, index) => (
                <Group key={index}>
                  {data.length > 1 ? (
                    <Button type="button" onClick={() => deleteRow(index)}>
                      X
                    </Button>
                  ) : null}
                  <TextInput
                    id={`${index}`}
                    onChange={changeHandler}
                    value={code}
                  />
                </Group>
              ))}
            </Stack>
            <Tooltip
              label="you must choose a type and at least one code or name"
              opened={type === "" || (data.length === 1 && data[0] === "")}
            >
              <Button
                sx={{ maxWidth: "100px" }}
                type="submit"
                disabled={type === "" || (data.length === 1 && data[0] === "")}
              >
                Submit
              </Button>
            </Tooltip>
            {loading ? <Title order={3}>loading.........</Title> : null}
            {error.length > 0 && !loading ? (
              <Title order={3} color="red">
                {error}
              </Title>
            ) : null}
          </Stack>
        </form>
      )}
    </AppShell>
  );
};

export default Home;
